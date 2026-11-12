{{/*
Chart name
*/}}
{{- define "ui-base.name" -}}
{{- .Values.name | default .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Fully qualified release name
*/}}
{{- define "ui-base.fullname" -}}
{{- printf "%s-%s" .Release.Name (include "ui-base.name" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Return the container image reference.
Defaults tag to .Chart.AppVersion if empty.
*/}}
{{- define "ui-base.image" -}}
{{- $repo := .Values.image.repository -}}
{{- $tag := .Values.image.tag | default .Chart.AppVersion -}}
{{ printf "%s:%s" $repo $tag }}
{{- end -}}


{{/*
Return the number of replicas.
*/}}
{{- define "ui-base.replicas" -}}
{{- .Values.replicas | default 1 -}}
{{- end -}}

{{/*
Common labels applied to all resources
*/}}
{{- define "ui-base.labels" -}}
app.kubernetes.io/name: {{ include "ui-base.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "ui-base.renderUpstreams" -}}

# Base UI upstream (always present)
- id: ui
  path: /
  uri: http://{{ include "ui-base.name" . }}.{{ .Release.Namespace }}.svc.cluster.local:80
  passHostHeader: true
  proxyWebSockets: false

{{- range (.Values.upstreams | default list) }}
- id: {{ .id }}
  path: {{ .path }}
  uri: {{ include "ui-base.upstreamUri" (dict "target" .target "Release" $.Release) }}
  {{- if .rewriteTarget }}
  rewriteTarget: {{ .rewriteTarget }}
  {{- end }}
  passHostHeader: {{ .passHostHeader | default false }}
  proxyWebSockets: {{ .proxyWebSockets | default false }}
{{- end }}

{{- end }}


{{- define "ui-base.upstreamUri" -}}
{{- if .target.service -}}
http://{{ .target.service.name }}.{{ .Release.Namespace }}.svc.cluster.local:{{ .target.service.port }}
{{- else if .target.external -}}
{{ .target.external.uri }}
{{- end -}}
{{- end }}

{{- define "ui-base.identityIssuerURL" -}}
{{- $provider := .Values.identityProvider -}}
{{- $providers := .Values.identityProviders -}}

{{- if not (hasKey $providers $provider) -}}
{{- fail (printf "Invalid provider '%s'. Must be one of: %s"
        $provider (keys $providers | sortAlpha | join ", ")) -}}
{{- end -}}

{{- index $providers $provider -}}
{{- end -}}

{{/*
App-level oauth2proxy config options
*/}}
{{- define "ui-base.extraConfig" -}}
{{- .Values.authConfigFlags | default "" -}}
{{- end -}}
