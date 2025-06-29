"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const obsidian_1 = require("obsidian");
class RemoveHtmlTagsPlugin extends obsidian_1.Plugin {
    async onload() {
        console.log('Loading RemoveHtmlTagsPlugin');
        this.addCommand({
            id: 'remove',
            name: 'Remove',
            callback: () => this.removeHtmlTags(),
        });
    }
    onunload() {
        console.log('Unloading RemoveHtmlTagsPlugin');
    }
    removeHtmlTags() {
        const view = this.app.workspace.getActiveViewOfType(obsidian_1.MarkdownView);
        if (view && view.getViewType() === 'markdown') {
            const editor = view.editor;
            // 获取当前选择内容的范围
            const selection = editor.getSelection();
            const selectionStart = editor.getCursor("from");
            const selectionEnd = editor.getCursor("to");
            // 清除 HTML 标签
            const cleanedSelection = selection.replace(/<[^>]+>/g, '');
            // 更新选定的文本
            editor.replaceSelection(cleanedSelection);
            // 恢复光标到清除后的文本开头
            editor.setSelection(selectionStart, selectionStart);
        }
    }
}
exports.default = RemoveHtmlTagsPlugin;

/* nosourcemap */