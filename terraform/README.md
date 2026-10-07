# Terraform

Each directory is an independent stack with its own state file, so changes to
one stack cannot affect another's state.

| Stack           | Purpose                                   | State key               |
|-----------------|-------------------------------------------|-------------------------|
| `azure/core`    | Private network foundation (VNet, etc.)   | `azure/core.tfstate`    |
| `azure/backend` | Private backend app for the demo          | `azure/backend.tfstate` |

State lives in Azure Storage:

- Resource group: `test`
- Storage account: `tfbackend12`
- Container: `tfbackend`

Auth uses Entra ID (`use_azuread_auth = true`), so your identity needs the
**Storage Blob Data Contributor** role on the storage account.

## Usage

Apply in order — `backend` reads outputs from `core`:

```sh
az login --tenant 60133250-bb62-4bb2-bea7-9c38341c6c55

cd terraform/azure/core
terraform init
terraform plan

cd ../backend
terraform init
terraform plan
```

## Networking notes

- Everything is private: no public IPs, no public endpoints.
- Azure VNet uses `10.20.0.0/16`; keep the AWS VPC CIDR non-overlapping (e.g. `10.10.0.0/16`).
