import {CancellationToken, editor, languages, Position} from "monaco-editor";
import {CommonCompletionItem} from "../types/CommonCompletionItem";
import {FuncMap} from './FuncMap'
import {CompletionMeta} from "../types/CommonCompletionItem";
import CompletionItemProvider = languages.CompletionItemProvider
// @ts-ignore
import * as YAML from 'yaml-js'
import * as _ from 'lodash';

export default class HelmTemplateCompletionProvider implements CompletionItemProvider {

  constructor() {
    this.triggerCharacters = [".", " "]
    this.funcMap = new FuncMap()
  }

  funcMap: FuncMap
  triggerCharacters?: string[]
  private valuesMatcher = new RegExp('\\s+\\.Values\\.([a-zA-Z0-9\\._-]+)?$')
  private valuesCache: any

  provideCompletionItems(model: editor.ITextModel, position: Position, context: languages.CompletionContext, token: CancellationToken): languages.ProviderResult<languages.CompletionList> {
    // const wordPosition = model.getWordAtPosition(position)
    const wordUntilPosition = model.getWordUntilPosition(position);
    if (!wordUntilPosition) {
      return {suggestions: [], incomplete: false}
    }
    const line = model.getLineContent(position.lineNumber)
    const lineUntil = line.substr(0, wordUntilPosition.startColumn - 1)
    if (lineUntil.endsWith(".")) {
      const suggestions = this.dotCompletionItems(lineUntil).map((item: CompletionMeta): CommonCompletionItem => {
        return item.toCompletionItem(wordUntilPosition, position)
      });
      return {
        suggestions, incomplete: true
      }
    }

    //这里是要allFuncSuggestion
    const suggestions = this.funcMap.all().map((item: CompletionMeta): CommonCompletionItem => {
      return item.toCompletionItem(wordUntilPosition, position)
    })

    return {
      suggestions: suggestions,
      incomplete: true,
    }
  }

  /**
   * 这个是 . 后面的自动提示
   * 比如
   * .Values
   * .Release
   * .Values.xxx
   * @param lineUntil
   */
  dotCompletionItems(lineUntil: string): CompletionMeta[] {
    if (lineUntil.endsWith(" .")) {
      console.log('i should be here')
      return this.funcMap.helmVals();
    } else if (lineUntil.endsWith(".Release.")) {
      return this.funcMap.releaseVals();
    } else if (lineUntil.endsWith(".Chart.")) {
      return this.funcMap.chartVals();
    } else if (lineUntil.endsWith(".Files.")) {
      return this.funcMap.filesVals();
    } else if (lineUntil.endsWith(".Capabilities.")) {
      return this.funcMap.capabilitiesVals();
    } else if (lineUntil.endsWith(".Values.")) {
      if (!_.isPlainObject(this.valuesCache)) {
        return [];
      }
      const keys = _.keys(this.valuesCache);
      const res = keys.map((key) =>
        this.funcMap.v(key, ".Values." + key, "In values.yaml: " + this.valuesCache[key])
      );
      return res;
    } else {
      //走到这里，说明可能是 .Values.xxx,需要递归values内容去检查是否有可以提示的
      let reExecResult: RegExpExecArray | null = null
      try {
        reExecResult = this.valuesMatcher.exec(lineUntil)
      } catch (err) {
        console.error('find value path failed', err.message)
        return []
      }
      //没有找到任何匹配的
      if (!reExecResult || reExecResult.length === 0) {
        return []
      }
      console.log('exec result', reExecResult)
      if (reExecResult[1].length === 0) {
        return []
      }
      const valuesMatches = reExecResult
      //走到这里说明，匹配上了 .Values.xxx ，需要检查json树，去提供提示信息
      const parts = reExecResult[1].split(".")
      let cache = this.valuesCache
      for (const cur of parts) {
        if (cur.length === 0) {
          break
        }
        if (!cache[cur]) {
          // key 不在已知的values里面
          // todo 这里可以给一个添加的提示？如果用户添加了，就自动添加的values里面，丢一个事件到外面？
          return []
        }
        cache = cache[cur]
      }
      if (!cache) {
        return []
      }
      const k = _.keys(cache).map(item => {
        return this.funcMap.v(item, valuesMatches[0] + item, "In values.yaml: " + cache[item])
      })
      return k
    }
  }

  resolveCompletionItem(item: languages.CompletionItem, token: CancellationToken): languages.ProviderResult<languages.CompletionItem> {
    return undefined;
  }

  public refreshValues(values: string) {
    try {
      this.valuesCache = YAML.load(values)
    } catch (err) {
      console.error('fail to cache yaml str ', err.message)
    }

  }
}
