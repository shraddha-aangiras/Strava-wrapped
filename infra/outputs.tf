output "s3_bucket_name" {
  description = "S3 bucket name — used by deploy.sh to sync files"
  value       = aws_s3_bucket.frontend.bucket
}

output "s3_website_endpoint" {
  description = "S3 static website endpoint — add this as a CNAME in Cloudflare"
  value       = aws_s3_bucket_website_configuration.frontend.website_endpoint
}

output "oauth_callback_url" {
  description = "Set this as VITE_REDIRECT_URI in frontend/.env and as the Strava callback domain"
  value       = "${aws_apigatewayv2_stage.default.invoke_url}/auth/callback"
}

output "api_gateway_domain" {
  description = "Domain portion of the API Gateway URL — register this in Strava as the callback domain"
  value       = replace(aws_apigatewayv2_stage.default.invoke_url, "https://", "")
}
