#!/bin/bash
metric_name=$1      # Remove the asterisks
metric_value=$2     # Remove the asterisks
timestamp=$(date +%s)000000000

json_payload=$(cat <<JSON
{
  "resourceMetrics": [{
    "scopeMetrics": [{
      "metrics": [{
        "name": "${metric_name}",
        "gauge": {
          "dataPoints": [{
            "asDouble": ${metric_value},
            "timeUnixNano": ${timestamp},
            "attributes": [
              {"key": "job", "value": {"stringValue": "gitops_pipeline"}},
              {"key": "instance", "value": {"stringValue": "${PIPELINE_ID}"}}
            ]
          }]
        }
      }]
    }]
  }]
}
JSON
)

curl -X POST https://otlp-gateway-prod-us-east-2.grafana.net/otlp/v1/metrics \
  -H "Authorization: Basic $(echo -n '${GRAFANA_USER}:${GRAFANA_KEY}' | base64 -w 0)" \
  -H "Content-Type: application/json" \
  -d "$json_payload" \
  --silent --show-error