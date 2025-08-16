# CodePair Helm Chart

Installs the CodePair application, a collaborative coding platform powered by Yorkie.

## Prerequisites

- Kubernetes 1.23+
- Helm 3+

## Get Helm Repository Info

```bash
# TODO(krapie): need to centralize the helm repo
helm repo add yorkie-team https://yorkie-team.github.io/yorkie/helm-charts
helm repo update
```

_See [`helm repo`](https://helm.sh/docs/helm/helm_repo/) for command documentation._

## Install Helm Chart

```bash
# Create mongodb namespace if not already created
kubectl create namespace mongodb

# Install codepair helm chart with default values
helm install codepair yorkie-team/codepair -n codepair --create-namespace
```

_See [configuration](#configuration) below for custom installation_

_See [`helm install`](https://helm.sh/docs/helm/helm_install/) for command documentation._

## Dependencies

By default, this chart installs the following dependency:

- [yorkie-mongodb](https://github.com/yorkie-team/yorkie/tree/main/charts/yorkie-mongodb)

## Uninstall Helm Chart

```bash
helm uninstall codepair
```

This removes all the Kubernetes components associated with the chart and deletes the release.

_See [`helm uninstall`](https://helm.sh/docs/helm/helm_uninstall/) for command documentation._

## Upgrading Chart

```bash
helm upgrade codepair yorkie-team/codepair
```

_See [`helm upgrade`](https://helm.sh/docs/helm/helm_upgrade/) for command documentation._

## Configuration

See [Customizing the Chart Before Installing](https://helm.sh/docs/intro/using_helm/#customizing-the-chart-before-installing). To see all configurable options with detailed comments:

```console
helm show values yorkie-team/codepair
```

### Key Parameters

The following table lists the configurable parameters of the CodePair chart and their default values:

| Parameter | Description | Default |
| --------- | ----------- | ------- |
| `codepair.image.repository` | CodePair image repository | `yorkieteam/codepair` |
| `codepair.image.tag` | CodePair image tag | `0.1.32` |
| `codepair.autoscaling.replicaCount` | Number of CodePair replicas | `1` |
| `codepair.env.databaseUrl` | MongoDB connection URI | `mongodb://mongodb.mongodb.svc.cluster.local:27017/codepair` |
| `codepair.env.githubClientId` | GitHub OAuth Client ID | `""` |
| `codepair.env.githubClientSecret` | GitHub OAuth Client Secret | `""` |
| `codepair.env.frontendBaseUrl` | Frontend application URL | `""` |
| `codepair.env.yorkieApiAddr` | Yorkie API address | `""` |
| `ingress.enabled` | Enable ingress | `true` |
| `ingress.className` | Ingress class name | `alb` |
| `ingress.hosts.apiHost` | Host name for API | `codepair-api.yorkie.dev` |
| `yorkie-mongodb.enabled` | Enable MongoDB dependency | `true` |

You may also configure the MongoDB dependency. See the [yorkie-mongodb chart](https://github.com/yorkie-team/yorkie/tree/main/charts/yorkie-mongodb) for additional options.
