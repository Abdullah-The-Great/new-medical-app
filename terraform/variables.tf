variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "patient-records"
}

variable "callback_url" {
  type    = string
  default = "http://localhost:5173/"
}

variable "logout_url" {
  type    = string
  default = "http://localhost:5173/"
}