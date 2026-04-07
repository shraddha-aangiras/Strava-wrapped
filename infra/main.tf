
terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }

  backend "s3" {
    bucket         = "terraform-state-strava-wrapped"
    key            = "strava-wrapped/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks-strava-wrapped"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "strava-wrapped"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# ─────────────────────────────────────────────
# S3 — Public static website hosting
# Cloudflare sits in front and handles SSL/CDN
# ─────────────────────────────────────────────

resource "aws_s3_bucket" "frontend" {
  # Bucket name MUST match the subdomain exactly for direct DNS CNAME mapping
  bucket = "stravawrapped.${var.domain_name}"
  
  force_destroy = true
}

resource "aws_s3_bucket_versioning" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Allow public read — Cloudflare fetches files on behalf of users
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket                  = aws_s3_bucket.frontend.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket     = aws_s3_bucket.frontend.id
  depends_on = [aws_s3_bucket_public_access_block.frontend]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "PublicReadGetObject"
      Effect    = "Allow"
      Principal = "*"
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.frontend.arn}/*"
    }]
  })
}

# Enable S3 static website hosting
resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  # SPA fallback — serve index.html for unknown paths
  error_document {
    key = "index.html"
  }
}

# ─────────────────────────────────────────────
# Lambda — OAuth callback handler
# ─────────────────────────────────────────────

resource "aws_iam_role" "lambda_exec" {
  name = "strava-wrapped-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "archive_file" "lambda" {
  type        = "zip"
  source_file = "${path.module}/lambda/callback.js"
  output_path = "${path.module}/lambda/callback.zip"
}

resource "aws_lambda_function" "oauth_callback" {
  function_name    = "strava-wrapped-oauth-callback"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "callback.handler"
  runtime          = "nodejs20.x"
  filename         = data.archive_file.lambda.output_path
  source_code_hash = data.archive_file.lambda.output_base64sha256
  timeout          = 10

  environment {
    variables = {
      STRAVA_CLIENT_ID     = var.strava_client_id
      STRAVA_CLIENT_SECRET = var.strava_client_secret
      FRONTEND_URL         = "https://stravawrapped.${var.domain_name}"
    }
  }
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${aws_lambda_function.oauth_callback.function_name}"
  retention_in_days = 7
}

# ─────────────────────────────────────────────
# API Gateway v2 (HTTP) — Lambda proxy
# ─────────────────────────────────────────────

resource "aws_apigatewayv2_api" "oauth" {
  name          = "strava-wrapped-oauth"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = ["https://stravawrapped.${var.domain_name}"]
    allow_methods = ["GET"]
    max_age       = 300
  }
}

resource "aws_cloudwatch_log_group" "apigw" {
  name              = "/aws/apigateway/strava-wrapped-oauth"
  retention_in_days = 7
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.oauth.id
  name        = "$default"
  auto_deploy = true
  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.apigw.arn
    format          = "$context.requestId $context.status $context.routeKey $context.error.message"
  }
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.oauth.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.oauth_callback.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "callback" {
  api_id    = aws_apigatewayv2_api.oauth.id
  route_key = "GET /auth/callback"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.oauth_callback.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.oauth.execution_arn}/*/*"
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}