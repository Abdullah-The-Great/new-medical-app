terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ---------- DynamoDB: stores observations ----------
resource "aws_dynamodb_table" "observations" {
  name         = "${var.project_name}-observations"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "patientId"
  range_key    = "observationId"

  attribute {
    name = "patientId"
    type = "S"
  }
  attribute {
    name = "observationId"
    type = "S"
  }
  attribute {
    name = "category"
    type = "S"
  }

  global_secondary_index {
    name            = "byCategory"
    hash_key        = "patientId"
    range_key       = "category"
    projection_type = "ALL"
  }
}

# ---------- Cognito: authentication ----------
resource "aws_cognito_user_pool" "main" {
  name = "${var.project_name}-users"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_uppercase = true
    require_symbols   = false
  }
}

resource "aws_cognito_user_pool_client" "web" {
  name         = "${var.project_name}-web"
  user_pool_id = aws_cognito_user_pool.main.id

  generate_secret = false

  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]
  allowed_oauth_flows_user_pool_client = true
  supported_identity_providers         = ["COGNITO"]

  callback_urls = [var.callback_url]
  logout_urls   = [var.logout_url]

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]
}

resource "random_id" "domain" {
  byte_length = 4
}

resource "aws_cognito_user_pool_domain" "main" {
  domain       = "${var.project_name}-${random_id.domain.hex}"
  user_pool_id = aws_cognito_user_pool.main.id
}