packer {
  required_plugins {
    amazon = {
      version = ">= 1.0.0, <2.0.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

# Variables
# SOURCE AMI FILTERS
variable "AMI_SOURCE_DESCRIPTION" {
  type = string
}

variable "AMI_SOURCE_ROOT_DEVICE_TYPE" {
  type    = string
  default = "ebs"
}

variable "AMI_SOURCE_VIRTUALIZATION" {
  type    = string
  default = "hvm"
}

variable "SOURCE_AMI_OWNERS" {
  type    = list(string)
  default = ["099720109477"] # Canonical
}

# AMI VARIABLES
variable "AWS_REGION" {
  type    = string
  default = "us-east-1"
}

variable "AMI_NAME" {
  type    = string
  default = "Ubuntu-AMI-Webapp"
}

variable "INSTANCE_TYPE" {
  type    = string
  default = "t2.micro"
}

variable "AMI_DESCRIPTION" {
  type    = string
  default = "Assignment_04_AMI"
}

variable "SSH_USER" {
  type    = string
  default = "ubuntu"
}

variable "VPC_IS_DEFAULT" {
  type    = string
  default = "true"
}

variable "AMI_USERS" {
  type    = list(string)
  default = ["664418960750", "537124970289"]
}

variable "AWS_PROFILE" {
  type    = string
  default = "dev"
}

# AMI
source "amazon-ebs" "custom-ami" {
  profile       = "${var.AWS_PROFILE}"
  ami_name      = "${var.AMI_DESCRIPTION}_${formatdate("YYYY-MM-DD-hh:mm:ss", timestamp())}"
  instance_type = "${var.INSTANCE_TYPE}"
  region        = "${var.AWS_REGION}"

  #Dev and Demo account ID with permission to use the AMI
  ami_users = "${var.AMI_USERS}"
  source_ami_filter {
    filters = {
      description         = "${var.AMI_SOURCE_DESCRIPTION}"
      root-device-type    = "${var.AMI_SOURCE_ROOT_DEVICE_TYPE}"
      virtualization-type = "${var.AMI_SOURCE_VIRTUALIZATION}"
    }
    most_recent = true
    owners      = "${var.SOURCE_AMI_OWNERS}"
  }

  ssh_username = "${var.SSH_USER}"

  vpc_filter {
    filters = {
      "isDefault" = "${var.VPC_IS_DEFAULT}"
    }
  }
}

# Build Block
build {
  name = "custom-ami"
  sources = [
    "source.amazon-ebs.custom-ami"
  ]
  provisioner "file" {
    source      = "../webapp.zip"
    destination = "~/webapp.zip"
  }

  provisioner "file" {
    source      = "../webapp.service"
    destination = "~/webapp.service"
  }
  provisioner "shell" {
    scripts = [
      "scripts/updateSystem.sh",
      "scripts/installSoftware.sh",
      "scripts/setupApp.sh",
    ]
  }

  post-processor "manifest" {
    output     = "manifest.json"
    strip_path = true
  }



}
