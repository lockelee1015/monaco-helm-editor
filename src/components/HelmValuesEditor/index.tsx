import React, {useEffect, useState} from 'react';
import MonacoEditor, {monaco} from 'react-monaco-editor';
import ValuesTemplateCompletionProvider from "./ValuesTemplateCompletionProvider";

export default function ({
                           values,
                           schema,
                           vars,
                           onChange
                         }: { values: string, schema: any, vars: object, onChange: Function }) {
  const [provider, setProvider] = useState<ValuesTemplateCompletionProvider>()

  const handler = (value: string, event: monaco.editor.IModelContentChangedEvent) => {
    onChange(value)
  }

  useEffect(() => {
    const vtcp = new ValuesTemplateCompletionProvider()
    monaco.languages.registerCompletionItemProvider('yaml', vtcp)
    vtcp.refreshVars(vars)
    setProvider(vtcp)
  }, [])

  useEffect(() => {
    provider?.refreshVars(vars)
  }, [vars])
  return <div style={{width: '100%', height: '100%'}}>
    <div style={{height: '100%'}}>
      <MonacoEditor
        width="100%"
        height="700px"
        language="yaml"
        theme="vs-light"
        value={values}
        onChange={handler}
        options={{selectOnLineNumbers: true}}
      />
    </div>
  </div>
}
