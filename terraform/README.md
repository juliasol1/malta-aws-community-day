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

## Why separate stacks?

`core` holds the long-lived network everything else plugs into. `backend` holds
the app that runs on it. Keeping them apart means experimenting with (or
destroying) the app can never touch the network, and each has a small, fast
plan.

## Network plan (AWS <-> Azure)

The two clouds will be joined by a private VPN, so their IP ranges must not
overlap.

| Side  | Range          | Status                                   |
|-------|----------------|------------------------------------------|
| Azure | `10.20.0.0/16` | Deployed: `awscd-core-vnet` (italynorth) |
| AWS   | `10.10.0.0/16` | Reserved for the AWS VPC                 |

- Everything is private: no public IPs, no public endpoints.
- Region is `italynorth` (`westeurope` is not accepting new resources on this
  subscription).
