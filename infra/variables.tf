variable "domain_name" {
  description = "Your root domain name (e.g. example.com)"
  type        = string
}

variable "strava_client_id" {
  description = "Strava API client ID"
  type        = string
}

variable "strava_client_secret" {
  description = "Strava API client secret"
  type        = string
  sensitive   = true
}

variable "aws_region" {
  description = "AWS region for Lambda and API Gateway"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "prod"
}

