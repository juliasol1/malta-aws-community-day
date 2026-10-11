# State for the backend service stack.
terraform {
  backend "local" {
    path = "terraform.tfstate"
  }
}
