import React from 'react';
import HelmTemplateEditor from '@/components/HelmTemplateEditor'
import {useLocalStorageState} from 'ahooks'
import HelmValuesEditor from '@/components/HelmValuesEditor'

var testData = "apiVersion: {{ include \"common.capabilities.deployment.apiVersion\" . }}\n" +
  "kind: Deployment\n" +
  "metadata:\n" +
  "  name: {{ include \"common.names.fullname\" . }}\n" +
  "  labels: {{- include \"common.labels.standard\" . | nindent 4 }}\n" +
  "    {{- if .Values.commonLabels }}\n" +
  "    {{- include \"common.tplvalues.render\" ( dict \"value\" .Values.commonLabels \"context\" $ ) | nindent 4 }}\n" +
  "    {{- end }}\n" +
  "  {{- if .Values.commonAnnotations }}\n" +
  "  annotations: {{- include \"common.tplvalues.render\" ( dict \"value\" .Values.commonAnnotations \"context\" $ ) | nindent 4 }}\n" +
  "  {{- end }}\n" +
  "spec:\n" +
  "  replicas: {{ .Values.replicaCount }}\n" +
  "  selector:\n" +
  "    matchLabels: {{- include \"common.labels.matchLabels\" . | nindent 6 }}\n" +
  "  template:\n" +
  "    metadata:\n" +
  "      labels: {{- include \"common.labels.standard\" . | nindent 8 }}\n" +
  "        {{- if .Values.podLabels }}\n" +
  "        {{- include \"common.tplvalues.render\" (dict \"value\" .Values.podLabels \"context\" $) | nindent 8 }}\n" +
  "        {{- end }}\n" +
  "      {{- if or .Values.podAnnotations (and .Values.metrics.enabled .Values.metrics.podAnnotations) (and .Values.serverBlock (not .Values.existingServerBlockConfigmap)) }}\n" +
  "      annotations:\n" +
  "        {{- if .Values.podAnnotations }}\n" +
  "        {{- include \"common.tplvalues.render\" ( dict \"value\" .Values.podAnnotations \"context\" $) | nindent 8 }}\n" +
  "        {{- end }}\n" +
  "        {{- if and .Values.metrics.enabled .Values.metrics.podAnnotations }}\n" +
  "        {{- include \"common.tplvalues.render\" ( dict \"value\" .Values.metrics.podAnnotations \"context\" $) | nindent 8 }}\n" +
  "        {{- end }}\n" +
  "        {{- if and .Values.serverBlock (not .Values.existingServerBlockConfigmap) }}\n" +
  "        checksum/server-block-configuration: {{ include (print $.Template.BasePath \"/server-block-configmap.yaml\") . | sha256sum }}\n" +
  "        {{- end }}\n" +
  "      {{- end }}\n" +
  "    spec:\n" +
  "      {{- include \"nginx.imagePullSecrets\" . | nindent 6 }}\n" +
  "      automountServiceAccountToken: {{ .Values.serviceAccount.autoMount }}\n" +
  "      serviceAccountName: {{ template \"nginx.serviceAccountName\" . }}\n" +
  "      {{- if .Values.hostAliases }}\n" +
  "      hostAliases: {{- include \"common.tplvalues.render\" (dict \"value\" .Values.hostAliases \"context\" $) | nindent 8 }}\n" +
  "      {{- end }}\n" +
  "      {{- if .Values.affinity }}\n" +
  "      affinity: {{- include \"common.tplvalues.render\" (dict \"value\" .Values.affinity \"context\" $) | nindent 8 }}\n" +
  "      {{- else }}\n" +
  "      affinity:\n" +
  "        podAffinity: {{- include \"common.affinities.pods\" (dict \"type\" .Values.podAffinityPreset \"context\" $) | nindent 10 }}\n" +
  "        podAntiAffinity: {{- include \"common.affinities.pods\" (dict \"type\" .Values.podAntiAffinityPreset \"context\" $) | nindent 10 }}\n" +
  "        nodeAffinity: {{- include \"common.affinities.nodes\" (dict \"type\" .Values.nodeAffinityPreset.type \"key\" .Values.nodeAffinityPreset.key \"values\" .Values.nodeAffinityPreset.values) | nindent 10 }}\n" +
  "      {{- end }}\n" +
  "      {{- if .Values.priorityClassName }}\n" +
  "      priorityClassName: {{ .Values.priorityClassName | quote }}\n" +
  "      {{- end }}\n" +
  "      {{- if .Values.nodeSelector }}\n" +
  "      nodeSelector: {{- include \"common.tplvalues.render\" (dict \"value\" .Values.nodeSelector \"context\" $) | nindent 8 }}\n" +
  "      {{- end }}\n" +
  "      {{- if .Values.tolerations }}\n" +
  "      tolerations: {{- include \"common.tplvalues.render\" (dict \"value\" .Values.tolerations \"context\" $) | nindent 8 }}\n" +
  "      {{- end }}\n" +
  "      {{- if .Values.podSecurityContext.enabled }}\n" +
  "      securityContext: {{- omit .Values.podSecurityContext \"enabled\" | toYaml | nindent 8 }}\n" +
  "      {{- end }}\n" +
  "      {{- if .Values.cloneStaticSiteFromGit.enabled }}\n" +
  "      initContainers:\n" +
  "        - name: git-clone-repository\n" +
  "          image: {{ include \"nginx.cloneStaticSiteFromGit.image\" . }}\n" +
  "          imagePullPolicy: {{ .Values.cloneStaticSiteFromGit.image.pullPolicy | quote }}\n" +
  "          {{- if .Values.cloneStaticSiteFromGit.gitClone.command }}\n" +
  "          command: {{- include \"common.tplvalues.render\" (dict \"value\" .Values.cloneStaticSiteFromGit.gitClone.command \"context\" $) | nindent 12 }}\n" +
  "          {{- else}}\n" +
  "          command:\n" +
  "            - /bin/bash\n" +
  "            - -ec\n" +
  "            - |\n" +
  "              [[ -f \"/opt/bitnami/scripts/git/entrypoint.sh\" ]] && source \"/opt/bitnami/scripts/git/entrypoint.sh\"\n" +
  "              git clone {{ .Values.cloneStaticSiteFromGit.repository }} --branch {{ .Values.cloneStaticSiteFromGit.branch }} /app\n" +
  "          {{- end}}\n" +
  "          {{- if .Values.cloneStaticSiteFromGit.gitClone.args }}\n" +
  "          args: {{- include \"common.tplvalues.render\" (dict \"value\" .Values.cloneStaticSiteFromGit.gitClone.args \"context\" $) | nindent 12 }}\n" +
  "          {{- end }}\n" +
  "          volumeMounts:\n" +
  "            - name: staticsite\n" +
  "              mountPath: /app\n" +
  "          {{- if .Values.cloneStaticSiteFromGit.extraVolumeMounts }}\n" +
  "            {{- include \"common.tplvalues.render\" (dict \"value\" .Values.cloneStaticSiteFromGit.extraVolumeMounts \"context\" $) | nindent 12 }}\n" +
  "          {{- end }}\n" +
  "          {{- if .Values.cloneStaticSiteFromGit.extraEnvVars }}\n" +
  "          env:\n" +
  "            {{- include \"common.tplvalues.render\" (dict \"value\" .Values.cloneStaticSiteFromGit.extraEnvVars \"context\" $) | nindent 12 }}\n" +
  "          {{- end }}\n" +
  "      containers:\n" +
  "        - name: git-repo-syncer\n" +
  "          image: {{ include \"nginx.cloneStaticSiteFromGit.image\" . }}\n" +
  "          imagePullPolicy: {{ .Values.cloneStaticSiteFromGit.image.pullPolicy | quote }}\n" +
  "          {{- if .Values.cloneStaticSiteFromGit.gitSync.command }}\n" +
  "          command: {{- include \"common.tplvalues.render\" (dict \"value\" .Values.cloneStaticSiteFromGit.gitSync.command \"context\" $) | nindent 12 }}\n" +
  "          {{- else}}\n" +
  "          command:\n" +
  "            - /bin/bash\n" +
  "            - -ec\n" +
  "            - |\n" +
  "              [[ -f \"/opt/bitnami/scripts/git/entrypoint.sh\" ]] && source \"/opt/bitnami/scripts/git/entrypoint.sh\"\n" +
  "              while true; do\n" +
  "                  cd /app && git pull origin {{ .Values.cloneStaticSiteFromGit.branch }}\n" +
  "                  sleep {{ .Values.cloneStaticSiteFromGit.interval }}\n" +
  "              done\n" +
  "          {{- end}}\n" +
  "          {{- if .Values.cloneStaticSiteFromGit.gitSync.args }}\n" +
  "          args: {{- include \"common.tplvalues.render\" (dict \"value\" .Values.cloneStaticSiteFromGit.gitSync.args \"context\" $) | nindent 12 }}\n" +
  "          {{- end }}\n" +
  "          volumeMounts:\n" +
  "            - name: staticsite\n" +
  "              mountPath: /app\n" +
  "          {{- if .Values.cloneStaticSiteFromGit.extraVolumeMounts }}\n" +
  "            {{- include \"common.tplvalues.render\" (dict \"value\" .Values.cloneStaticSiteFromGit.extraVolumeMounts \"context\" $) | nindent 12 }}\n" +
  "          {{- end }}\n" +
  "          {{- if .Values.cloneStaticSiteFromGit.extraEnvVars }}\n" +
  "          env:\n" +
  "            {{- include \"common.tplvalues.render\" (dict \"value\" .Values.cloneStaticSiteFromGit.extraEnvVars \"context\" $) | nindent 12 }}\n" +
  "          {{- end }}\n" +
  "      {{- else }}\n" +
  "      {{- with .Values.initContainers }}\n" +
  "      initContainers:\n" +
  "      {{- include \"common.tplvalues.render\" ( dict \"value\" . \"context\" $ ) | nindent 8}}\n" +
  "      {{- end }}\n" +
  "      containers:\n" +
  "      {{- end }}\n" +
  "        - name: nginx\n" +
  "          image: {{ include \"nginx.image\" . }}\n" +
  "          imagePullPolicy: {{ .Values.image.pullPolicy | quote }}\n" +
  "          {{- if .Values.containerSecurityContext.enabled }}\n" +
  "          securityContext: {{- omit .Values.containerSecurityContext \"enabled\" | toYaml | nindent 12 }}\n" +
  "          {{- end }}\n" +
  "          {{- if .Values.command }}\n" +
  "          command: {{- include \"common.tplvalues.render\" (dict \"value\" .Values.command \"context\" $) | nindent 12 }}\n" +
  "          {{- end }}\n" +
  "          {{- if .Values.args }}\n" +
  "          args: {{- include \"common.tplvalues.render\" (dict \"value\" .Values.args \"context\" $) | nindent 12 }}\n" +
  "          {{- end }}\n" +
  "          env:\n" +
  "            - name: BITNAMI_DEBUG\n" +
  "              value: {{ ternary \"true\" \"false\" .Values.image.debug | quote }}\n" +
  "            {{- if .Values.extraEnvVars }}\n" +
  "            {{- include \"common.tplvalues.render\" (dict \"value\" .Values.extraEnvVars \"context\" $) | nindent 12 }}\n" +
  "            {{- end }}\n" +
  "          {{- if or .Values.extraEnvVarsCM .Values.extraEnvVarsSecret }}\n" +
  "          envFrom:\n" +
  "            {{- if .Values.extraEnvVarsCM }}\n" +
  "            - configMapRef:\n" +
  "                name: {{ tpl .Values.extraEnvVarsCM . | quote }}\n" +
  "            {{- end }}\n" +
  "            {{- if .Values.extraEnvVarsSecret }}\n" +
  "            - secretRef:\n" +
  "                name: {{ tpl .Values.extraEnvVarsSecret . | quote }}\n" +
  "            {{- end }}\n" +
  "          {{- end }}\n" +
  "          ports:\n" +
  "            - name: http\n" +
  "              containerPort: {{ .Values.containerPorts.http }}\n" +
  "            {{- if .Values.containerPorts.https }}\n" +
  "            - name: https\n" +
  "              containerPort: {{ .Values.containerPorts.https }}\n" +
  "            {{- end }}\n" +
  "          {{- if .Values.livenessProbe.enabled }}\n" +
  "          livenessProbe:\n" +
  "            tcpSocket:\n" +
  "              port: http\n" +
  "            periodSeconds: {{ .Values.livenessProbe.periodSeconds }}\n" +
  "            timeoutSeconds: {{ .Values.livenessProbe.timeoutSeconds }}\n" +
  "            successThreshold: {{ .Values.livenessProbe.successThreshold }}\n" +
  "            failureThreshold: {{ .Values.livenessProbe.failureThreshold }}\n" +
  "          {{- else if .Values.customLivenessProbe }}\n" +
  "          livenessProbe: {{- include \"common.tplvalues.render\" (dict \"value\" .Values.customLivenessProbe \"context\" $) | nindent 12 }}\n" +
  "          {{- end }}\n" +
  "          {{- if .Values.readinessProbe.enabled }}\n" +
  "          readinessProbe:\n" +
  "            tcpSocket:\n" +
  "              port: http\n" +
  "            initialDelaySeconds: {{ .Values.readinessProbe.initialDelaySeconds }}\n" +
  "            periodSeconds: {{ .Values.readinessProbe.periodSeconds }}\n" +
  "            timeoutSeconds: {{ .Values.readinessProbe.timeoutSeconds }}\n" +
  "            successThreshold: {{ .Values.readinessProbe.successThreshold }}\n" +
  "            failureThreshold: {{ .Values.readinessProbe.failureThreshold }}\n" +
  "          {{- else if .Values.customReadinessProbe }}\n" +
  "          readinessProbe: {{- include \"common.tplvalues.render\" (dict \"value\" .Values.customReadinessProbe \"context\" $) | nindent 12 }}\n" +
  "          {{- end }}\n" +
  "          {{- if .Values.resources }}\n" +
  "          resources: {{- toYaml .Values.resources | nindent 12 }}\n" +
  "          {{- end }}\n" +
  "          volumeMounts:\n" +
  "            {{- if or .Values.serverBlock .Values.existingServerBlockConfigmap .Values.ldapDaemon.enabled}}\n" +
  "            - name: nginx-server-block-paths\n" +
  "              mountPath: /opt/bitnami/nginx/conf/server_blocks\n" +
  "            {{- end }}\n" +
  "            {{- if or .Values.serverBlock .Values.existingServerBlockConfigmap }}\n" +
  "            - name: nginx-server-block\n" +
  "              mountPath: /opt/bitnami/nginx/conf/server_blocks/common\n" +
  "            {{- end }}\n" +
  "            {{- if .Values.ldapDaemon.enabled }}\n" +
  "            - name: nginx-server-block-ldap\n" +
  "              mountPath: /opt/bitnami/nginx/conf/server_blocks/ldap\n" +
  "            {{- end }}\n" +
  "            {{- if (include \"nginx.useStaticSite\" .) }}\n" +
  "            - name: staticsite\n" +
  "              mountPath: /app\n" +
  "            {{- end }}\n" +
  "            {{- if .Values.extraVolumeMounts }}\n" +
  "            {{- include \"common.tplvalues.render\" ( dict \"value\" .Values.extraVolumeMounts \"context\" $) | nindent 12 }}\n" +
  "            {{- end }}\n" +
  "        {{- if .Values.ldapDaemon.enabled }}\n" +
  "        - name: ldap-daemon\n" +
  "          image: {{ include \"nginx.ldapDaemon.image\" . }}\n" +
  "          imagePullPolicy: {{ .Values.ldapDaemon.image.pullPolicy | quote }}\n" +
  "          env:\n" +
  "            - name: NGINXLDAP_PORT_NUMBER\n" +
  "              value: {{ .Values.ldapDaemon.port | quote}}\n" +
  "            - name: NGINXLDAP_LDAP_URI\n" +
  "              value: {{ .Values.ldapDaemon.ldapConfig.uri | quote }}\n" +
  "            - name: NGINXLDAP_LDAP_BASE_DN\n" +
  "              value: {{ .Values.ldapDaemon.ldapConfig.baseDN | quote }}\n" +
  "            - name: NGINXLDAP_LDAP_BIND_DN\n" +
  "              value: {{ .Values.ldapDaemon.ldapConfig.bindDN | quote }}\n" +
  "            - name: NGINXLDAP_LDAP_BIND_PASSWORD\n" +
  "              valueFrom:\n" +
  "                secretKeyRef:\n" +
  "                  name: {{ template \"common.names.fullname\" . }}-ldap-daemon\n" +
  "                  key: ldap-daemon-ldap-bind-password\n" +
  "            - name: NGINXLDAP_LDAP_FILTER\n" +
  "              value: {{ .Values.ldapDaemon.ldapConfig.filter | quote }}\n" +
  "            - name: NGINXLDAP_HTTP_REALM\n" +
  "              value: {{ .Values.ldapDaemon.ldapConfig.httpRealm | quote }}\n" +
  "            - name: NGINXLDAP_HTTP_COOKIE_NAME\n" +
  "              value: {{ .Values.ldapDaemon.ldapConfig.httpCookieName | quote }}\n" +
  "          ports:\n" +
  "            - name: ldap-daemon\n" +
  "              containerPort: {{ .Values.ldapDaemon.port }}\n" +
  "          {{- if .Values.ldapDaemon.livenessProbe.enabled }}\n" +
  "          livenessProbe:\n" +
  "            tcpSocket:\n" +
  "              port: ldap-daemon\n" +
  "            periodSeconds: {{ .Values.ldapDaemon.livenessProbe.periodSeconds }}\n" +
  "            timeoutSeconds: {{ .Values.ldapDaemon.livenessProbe.timeoutSeconds }}\n" +
  "            successThreshold: {{ .Values.ldapDaemon.livenessProbe.successThreshold }}\n" +
  "            failureThreshold: {{ .Values.ldapDaemon.livenessProbe.failureThreshold }}\n" +
  "          {{- else if .Values.ldapDaemon.customLivenessProbe }}\n" +
  "          livenessProbe: {{- include \"common.tplvalues.render\" (dict \"value\" .Values.ldapDaemon.customLivenessProbe \"context\" $) | nindent 12 }}\n" +
  "          {{- end }}\n" +
  "          {{- if .Values.ldapDaemon.readinessProbe.enabled }}\n" +
  "          readinessProbe:\n" +
  "            tcpSocket:\n" +
  "              port: ldap-daemon\n" +
  "            initialDelaySeconds: {{ .Values.ldapDaemon.readinessProbe.initialDelaySeconds }}\n" +
  "            periodSeconds: {{ .Values.ldapDaemon.readinessProbe.periodSeconds }}\n" +
  "            timeoutSeconds: {{ .Values.ldapDaemon.readinessProbe.timeoutSeconds }}\n" +
  "            successThreshold: {{ .Values.ldapDaemon.readinessProbe.successThreshold }}\n" +
  "            failureThreshold: {{ .Values.ldapDaemon.readinessProbe.failureThreshold }}\n" +
  "          {{- else if .Values.ldapDaemon.customReadinessProbe }}\n" +
  "          readinessProbe: {{- include \"common.tplvalues.render\" (dict \"value\" .Values.ldapDaemon.customReadinessProbe \"context\" $) | nindent 12 }}\n" +
  "          {{- end }}\n" +
  "        {{- end }}\n" +
  "        {{- if .Values.metrics.enabled }}\n" +
  "        - name: metrics\n" +
  "          image: {{ include \"nginx.metrics.image\" . }}\n" +
  "          imagePullPolicy: {{ .Values.metrics.image.pullPolicy | quote }}\n" +
  "          {{- if .Values.metrics.securityContext.enabled }}\n" +
  "          securityContext: {{- omit .Values.metrics.securityContext \"enabled\" | toYaml | nindent 12 }}\n" +
  "          {{- end }}\n" +
  "          command: ['/usr/bin/exporter', '-nginx.scrape-uri', 'http://127.0.0.1:{{- default .Values.containerPorts.http .Values.metrics.port }}/status']\n" +
  "          ports:\n" +
  "            - name: metrics\n" +
  "              containerPort: 9113\n" +
  "          livenessProbe:\n" +
  "            httpGet:\n" +
  "              path: /metrics\n" +
  "              port: metrics\n" +
  "            initialDelaySeconds: 15\n" +
  "            timeoutSeconds: 5\n" +
  "          readinessProbe:\n" +
  "            httpGet:\n" +
  "              path: /metrics\n" +
  "              port: metrics\n" +
  "            initialDelaySeconds: 5\n" +
  "            timeoutSeconds: 1\n" +
  "          {{- if .Values.metrics.resources }}\n" +
  "          resources: {{- toYaml .Values.metrics.resources | nindent 12 }}\n" +
  "          {{- end }}\n" +
  "        {{- end }}\n" +
  "        {{- with .Values.sidecars }}\n" +
  "        {{- include \"common.tplvalues.render\" ( dict \"value\" . \"context\" $ ) | nindent 8}}\n" +
  "        {{- end }}\n" +
  "      volumes:\n" +
  "        - name: nginx-server-block-paths\n" +
  "          configMap:\n" +
  "            name: {{ template \"common.names.fullname\" . }}-server-block\n" +
  "            items:\n" +
  "              - key: server-blocks-paths.conf\n" +
  "                path: server-blocks-paths.conf\n" +
  "        {{- if or .Values.serverBlock .Values.existingServerBlockConfigmap .Values.extraVolumes (include \"nginx.useStaticSite\" .) }}\n" +
  "        {{- if or .Values.serverBlock .Values.existingServerBlockConfigmap }}\n" +
  "        - name: nginx-server-block\n" +
  "          configMap:\n" +
  "            name: {{ include \"nginx.serverBlockConfigmapName\" . }}\n" +
  "            {{- if or .Values.serverBlock }}\n" +
  "            items:\n" +
  "              - key: server-block.conf\n" +
  "                path: server-block.conf\n" +
  "            {{- end }}\n" +
  "        {{- end }}\n" +
  "        {{- if (include \"nginx.useStaticSite\" .) }}\n" +
  "        - name: staticsite\n" +
  "          {{- include \"nginx.staticSiteVolume\" . | nindent 10 }}\n" +
  "        {{- end }}\n" +
  "        {{- if .Values.extraVolumes }}\n" +
  "        {{- include \"common.tplvalues.render\" ( dict \"value\" .Values.extraVolumes \"context\" $) | nindent 8 }}\n" +
  "        {{- end }}\n" +
  "        {{- end }}\n" +
  "        {{- if .Values.ldapDaemon.enabled }}\n" +
  "        - name: nginx-server-block-ldap\n" +
  "          secret:\n" +
  "            secretName: {{ include \"ldap.nginxServerBlockSecret\" . }}\n" +
  "        {{- end }}\n"

const schema = {
  "$schema": "http://json-schema.org/schema#",
  "type": "object",
  "properties": {
    "ingress": {
      "type": "object",
      "form": true,
      "title": "Ingress details",
      "properties": {
        "enabled": {
          "type": "boolean",
          "form": true,
          "title": "Use a custom hostname",
          "description": "Enable the ingress resource that allows you to access the NGINX installation."
        },
        "hostname": {
          "type": "string",
          "form": true,
          "title": "Hostname",
          "hidden": {
            "value": false,
            "path": "ingress/enabled"
          }
        }
      }
    },
    "service": {
      "type": "object",
      "form": true,
      "title": "Service Configuration",
      "properties": {
        "type": {
          "type": "string",
          "form": true,
          "title": "Service Type",
          "description": "Allowed values: \"ClusterIP\", \"NodePort\" and \"LoadBalancer\""
        }
      }
    },
    "replicaCount": {
      "type": "integer",
      "form": true,
      "title": "Number of replicas",
      "description": "Number of replicas to deploy"
    },
    "serverBlock": {
      "type": "string",
      "form": true,
      "title": "Custom server block",
      "description": "Custom server block to be added to NGINX configuration"
    },
    "metrics": {
      "type": "object",
      "form": true,
      "title": "Prometheus metrics details",
      "properties": {
        "enabled": {
          "type": "boolean",
          "title": "Create Prometheus metrics exporter",
          "description": "Create a side-car container to expose Prometheus metrics",
          "form": true
        },
        "serviceMonitor": {
          "type": "object",
          "properties": {
            "enabled": {
              "type": "boolean",
              "title": "Create Prometheus Operator ServiceMonitor",
              "description": "Create a ServiceMonitor to track metrics using Prometheus Operator",
              "form": true,
              "hidden": {
                "value": false,
                "path": "metrics/enabled"
              }
            }
          }
        }
      }
    },
    "pdb": {
      "type": "object",
      "properties": {
        "create": {
          "type": "boolean"
        },
        "minAvailable": {
          "type": "integer"
        },
        "maxUnavailable": {
          "type": "integer"
        }
      }
    }
  }
}

const vars = {
  "foo": {"description": "it's a foo"},
  "bar": {"description": "it's a bar"}
}


export default function () {
  const [val, setValues] = useLocalStorageState<string>('helm.values')
  const values = val ? val.toString() : ""
  return (
    <div style={{width: '100%', height: '100%'}}>
      <div style={{width: 'calc( 100% - 360px)', float: 'left'}}>
        <div>
          <h4 style={{paddingLeft: '20px'}}>Template</h4>
        </div>
        <div>
          <HelmTemplateEditor values={values} template={{name: 'main', type: 'deployment', content: testData}}/>
        </div>
      </div>
      <div style={{width: '360px', float: 'left'}}>
        <div>
          <h4>Values</h4>
        </div>
        <div>
          <HelmValuesEditor schema={schema} vars={vars} values={values} onChange={(v: string) => setValues(v)}/>
        </div>
      </div>
      ---
    </div>
  );
}
