import {editor, IRange, languages, Position} from "monaco-editor";
import CompletionItem = languages.CompletionItem;
import IWordAtPosition = editor.IWordAtPosition;
import CompletionItemInsertTextRule = languages.CompletionItemInsertTextRule;

export interface CompletionMeta {
  toCompletionItem(currentWord: IWordAtPosition, position: Position): CommonCompletionItem
}


export class ConstantCompletionMeta implements CompletionMeta {

  constructor(name: string, use: string, doc: string) {
    this.name = name
    this.use = use
    this.doc = doc
  }

  name: string
  use: string
  doc: string

  toCompletionItem(currentWord: editor.IWordAtPosition, position: Position): CommonCompletionItem {
    const item = CommonCompletionItem.instance(this.name, this.use, languages.CompletionItemKind.Constant, currentWord, position);
    item.detail = this.doc
    item.documentation = this.doc
    return item
  }
}

export class CommonCompletionItem implements CompletionItem {

  constructor(label: string, insertText: string, currentWord: IWordAtPosition, position: Position) {
    this.insertText = insertText
    this.kind = languages.CompletionItemKind.Variable
    this.label = label
    this.range = {
      startLineNumber: position.lineNumber,
      startColumn: currentWord.startColumn,
      endLineNumber: position.lineNumber,
      endColumn: currentWord.endColumn//position.column + insertText.length
    }
  }

  static var(label: string, insertText: string, currentWord: IWordAtPosition, position: Position) {
    return new CommonCompletionItem(label, insertText, currentWord, position)
  }

  static instance(label: string, insertText: string, kind: languages.CompletionItemKind, currentWord: IWordAtPosition, position: Position) {
    const res = new CommonCompletionItem(label, insertText, currentWord, position)
    res.kind = kind
    return res
  }

  detail?: string;
  documentation?: string;
  insertTextRules?: CompletionItemInsertTextRule;
  insertText: string;
  kind: languages.CompletionItemKind;
  label: string | languages.CompletionItemLabel;
  range: IRange | { insert: IRange; replace: IRange };

}

// export interface CompletionItem {
//   /**
//    * The label of this completion item. By default
//    * this is also the text that is inserted when selecting
//    * this completion.
//    */
//   label: string | CompletionItemLabel;
//   /**
//    * The kind of this completion item. Based on the kind
//    * an icon is chosen by the editor.
//    */
//   kind: CompletionItemKind;
//   /**
//    * A modifier to the `kind` which affect how the item
//    * is rendered, e.g. Deprecated is rendered with a strikeout
//    */
//   tags?: ReadonlyArray<CompletionItemTag>;
//   /**
//    * A human-readable string with additional information
//    * about this item, like type or symbol information.
//    */
//   detail?: string;
//   /**
//    * A human-readable string that represents a doc-comment.
//    */
//   documentation?: string | IMarkdownString;
//   /**
//    * A string that should be used when comparing this item
//    * with other items. When `falsy` the {@link CompletionItem.label label}
//    * is used.
//    */
//   sortText?: string;
//   /**
//    * A string that should be used when filtering a set of
//    * completion items. When `falsy` the {@link CompletionItem.label label}
//    * is used.
//    */
//   filterText?: string;
//   /**
//    * Select this item when showing. *Note* that only one completion item can be selected and
//    * that the editor decides which item that is. The rule is that the *first* item of those
//    * that match best is selected.
//    */
//   preselect?: boolean;
//   /**
//    * A string or snippet that should be inserted in a document when selecting
//    * this completion.
//    * is used.
//    */
//   insertText: string;
//   /**
//    * Addition rules (as bitmask) that should be applied when inserting
//    * this completion.
//    */
//   insertTextRules?: CompletionItemInsertTextRule;
//   /**
//    * A range of text that should be replaced by this completion item.
//    *
//    * Defaults to a range from the start of the {@link TextDocument.getWordRangeAtPosition current word} to the
//    * current position.
//    *
//    * *Note:* The range must be a {@link Range.isSingleLine single line} and it must
//    * {@link Range.contains contain} the position at which completion has been {@link CompletionItemProvider.provideCompletionItems requested}.
//    */
//   range: IRange | {
//     insert: IRange;
//     replace: IRange;
//   };
//   /**
//    * An optional set of characters that when pressed while this completion is active will accept it first and
//    * then type that character. *Note* that all commit characters should have `length=1` and that superfluous
//    * characters will be ignored.
//    */
//   commitCharacters?: string[];
//   /**
//    * An optional array of additional text edits that are applied when
//    * selecting this completion. Edits must not overlap with the main edit
//    * nor with themselves.
//    */
//   additionalTextEdits?: editor.ISingleEditOperation[];
//   /**
//    * A command that should be run upon acceptance of this item.
//    */
//   command?: Command;
// }
