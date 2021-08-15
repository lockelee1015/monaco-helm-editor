import React, {useEffect, useState} from 'react';
import MonacoEditor, {monaco} from 'react-monaco-editor';
import {Template} from "./types";
import HelmTemplateCompletionProvider from './HelmTemplateCompletionProvider'
import {HELM_TEMPLATE_LANGUAGE, HELM_TEMPLATE_LANGUAGE_CONF} from './HelmTemplateLanguage'

export default function ({template, values}: { template: Template, values: string }) {

  const [provider, setProvider] = useState<HelmTemplateCompletionProvider>()

  useEffect(() => {
    const htcp = new HelmTemplateCompletionProvider()
    monaco.languages.register({id: 'helm-template'})
    monaco.languages.setMonarchTokensProvider("helm-template", HELM_TEMPLATE_LANGUAGE)
    monaco.languages.setLanguageConfiguration('helm-template', HELM_TEMPLATE_LANGUAGE_CONF)
    monaco.languages.registerCompletionItemProvider('helm-template', htcp)
    
    htcp.refreshValues(values)
    setProvider(htcp)
  }, [])

  useEffect(() => {
    provider?.refreshValues(values)
  }, [values])

  // @ts-ignore
  return <div style={{width: '100%', height: '100%'}}>
    <div style={{height: '100%'}} key={template.name}>
      <MonacoEditor
        width="100%"
        height="700px"
        language="helm-template"
        theme="vs-light"
        value={template.content}
        options={{selectOnLineNumbers: true}}
      />
    </div>
  </div>
}
