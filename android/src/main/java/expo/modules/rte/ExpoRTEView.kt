package expo.modules.rte

import android.content.Context
import android.graphics.Typeface
import android.text.*
import android.text.method.LinkMovementMethod
import android.text.style.*
import android.widget.EditText
import android.widget.TextView
import androidx.core.os.bundleOf
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView
import java.util.*

class ExpoRTEView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  companion object {
    var currentFocusedView: ExpoRTEView? = null
    var moduleInstance: ExpoRTEModule? = null
  }

  private val editText: EditText
  private val undoStack = Stack<CharSequence>()
  private val redoStack = Stack<CharSequence>()

  init {
    editText = EditText(context).apply {
      layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
      movementMethod = LinkMovementMethod.getInstance()
      inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_MULTI_LINE
      
      addTextChangedListener(object : TextWatcher {
        override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {
          // Save state for undo
          s?.let { saveUndoState(it) }
        }

        override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}

        override fun afterTextChanged(s: Editable?) {
          post {
            moduleInstance?.sendEvent("onChange", bundleOf("content" to getHtmlContent()))
          }
        }
      })

      setOnFocusChangeListener { _, hasFocus ->
        if (hasFocus) {
          currentFocusedView = this@ExpoRTEView
        }
      }
    }
    
    addView(editText)
  }

  fun setContent(content: String) {
    val spanned = if (content.contains("<") && content.contains(">")) {
      Html.fromHtml(content, Html.FROM_HTML_MODE_LEGACY)
    } else {
      SpannableString(content)
    }
    editText.setText(spanned, android.widget.TextView.BufferType.SPANNABLE)
  }

  fun getContent(): String {
    return getHtmlContent()
  }

  fun setPlaceholder(placeholder: String) {
    editText.hint = placeholder
  }

  fun setEditable(editable: Boolean) {
    editText.isEnabled = editable
  }

  fun format(type: String, value: Any?) {
    post {
      val start = editText.selectionStart
      val end = editText.selectionEnd
      
      if (start == end) return@post // No selection
      
      val spannable = editText.text as SpannableStringBuilder
      
      when (type) {
        "bold" -> {
          val boldSpan = StyleSpan(Typeface.BOLD)
          spannable.setSpan(boldSpan, start, end, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
        }
        "italic" -> {
          val italicSpan = StyleSpan(Typeface.ITALIC)
          spannable.setSpan(italicSpan, start, end, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
        }
        "underline" -> {
          val underlineSpan = UnderlineSpan()
          spannable.setSpan(underlineSpan, start, end, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
        }
        "strikethrough" -> {
          val strikethroughSpan = StrikethroughSpan()
          spannable.setSpan(strikethroughSpan, start, end, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
        }
        "bullet" -> {
          val bulletSpan = BulletSpan()
          spannable.setSpan(bulletSpan, start, end, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
        }
        "link" -> {
          val url = value?.toString() ?: "http://example.com"
          val urlSpan = URLSpan(url)
          spannable.setSpan(urlSpan, start, end, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
        }
      }
      
      // Keep selection after formatting
      editText.setSelection(start, end)
    }
  }

  // Image functionality removed for stability

  fun undo() {
    post {
      if (undoStack.isNotEmpty()) {
        val currentText = editText.text
        redoStack.push(currentText)
        val previousText = undoStack.pop()
        editText.setText(previousText)
        editText.setSelection(previousText.length)
      }
    }
  }

  fun redo() {
    post {
      if (redoStack.isNotEmpty()) {
        val currentText = editText.text
        undoStack.push(currentText)
        val nextText = redoStack.pop()
        editText.setText(nextText)
        editText.setSelection(nextText.length)
      }
    }
  }

  private fun saveUndoState(text: CharSequence) {
    undoStack.push(SpannableStringBuilder(text))
    redoStack.clear() // Clear redo stack when new action is performed
    
    // Limit undo stack size
    if (undoStack.size > 50) {
      undoStack.removeAt(0)
    }
  }

  private fun getHtmlContent(): String {
    return Html.toHtml(editText.text as Spanned, Html.TO_HTML_PARAGRAPH_LINES_CONSECUTIVE)
  }
}
