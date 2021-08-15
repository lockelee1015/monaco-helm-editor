import {CancellationToken, editor, languages, Position} from "monaco-editor";
import {CommonCompletionItem, CompletionMeta, ConstantCompletionMeta} from "../types/CommonCompletionItem";
import CompletionItemProvider = languages.CompletionItemProvider
// @ts-ignore
import * as YAML from 'yaml-js'
import * as _ from 'lodash';

export default class ValuesTemplateCompletionProvider implements CompletionItemProvider {

  constructor() {
    this.triggerCharacters = ["{"]
  }

  triggerCharacters?: string[]
  private varsCache: any

  provideCompletionItems(model: editor.ITextModel, position: Position, context: languages.CompletionContext, token: CancellationToken): languages.ProviderResult<languages.CompletionList> {
    const wordUntilPosition = model.getWordUntilPosition(position);
    if (!wordUntilPosition) {
      return {suggestions: [], incomplete: false}
    }
    const line = model.getLineContent(position.lineNumber)
    const lineUntil = line.substr(0, wordUntilPosition.startColumn - 1)
    if (lineUntil.endsWith("${")) {
      console.log('line until', lineUntil)
      const suggestions = this.bracketCompletionItems(lineUntil).map((item: CompletionMeta): CommonCompletionItem => {
        return item.toCompletionItem(wordUntilPosition, position)
      });
      console.log('suggestions', suggestions)
      return {
        suggestions, incomplete: true
      }
    }

    return {
      suggestions: [],
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
  bracketCompletionItems(lineUntil: string): CompletionMeta[] {
    if (!_.isPlainObject(this.varsCache)) {
      return []
    }
    const keys = _.keys(this.varsCache)
    console.log('keys-', keys)
    return keys.map((key) => {
      return new ConstantCompletionMeta(key, key, this.varsCache[key]?.description);
    })
  }

  resolveCompletionItem(item: languages.CompletionItem, token: CancellationToken): languages.ProviderResult<languages.CompletionItem> {
    return undefined;
  }

  public refreshVars(vars: object) {
    this.varsCache = vars
  }
}
