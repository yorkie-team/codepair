{{/*
Expand the name of the chart.
*/}}
{{- define "codepair.name" -}}
{{- default .Chart.Name .Values.codepair.name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
*/}}
{{- define "codepair.fullname" -}}
{{- if .Values.codepair.name }}
{{- .Values.codepair.name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "codepair.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "codepair.labels" -}}
helm.sh/chart: {{ include "codepair.chart" . }}
{{ include "codepair.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "codepair.selectorLabels" -}}
app.kubernetes.io/name: {{ include "codepair.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
