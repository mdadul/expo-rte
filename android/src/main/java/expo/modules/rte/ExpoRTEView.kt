package expo.modules.rte

import android.content.Context
import android.graphics.Typeface
import android.text.*
import android.text.method.LinkMovementMethod
import android.text.style.*
import android.view.ViewGroup
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

  private lateinit var editText: CustomEditText
  private val undoStack = Stack<CharSequence>()
  private val redoStack = Stack<CharSequence>()
  private var isUndoOrRedoInProgress = false
  private var lastSavedHash = 0
  
  // Custom EditText to detect selection changes
  private inner class CustomEditText(context: Context) : EditText(context) {
    override fun onSelectionChanged(selStart: Int, selEnd: Int) {
      super.onSelectionChanged(selStart, selEnd)
      // Send selection change event
      moduleInstance?.sendEvent("onSelectionChange", bundleOf(
        "start" to selStart,
        "end" to selEnd
      ))
    }
  }

  init {
    setupEditText()
  }
  
  private fun setupEditText() {
    editText = CustomEditText(context).apply {
      layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
      movementMethod = LinkMovementMethod.getInstance()
      inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_MULTI_LINE or InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS
      
      // Initialize with a SpannableStringBuilder to support rich formatting
      // Use EDITABLE buffer type for proper span management
      val initialText = SpannableStringBuilder("")
      setText(initialText, TextView.BufferType.EDITABLE)
      
      // Initialize undo/redo stacks
      undoStack.clear()
      redoStack.clear()
      
      // Add initial empty state to undo stack
      undoStack.push(SpannableStringBuilder(initialText))
      lastSavedHash = initialText.toString().hashCode()
      
      addTextChangedListener(object : TextWatcher {
        private var previousText: CharSequence? = null
        
        override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {
          // Store the text before changes for comparison
          previousText = s?.toString()
        }

        override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}

        override fun afterTextChanged(s: Editable?) {
          post {
            // Only save undo state if text actually changed and not during undo/redo
            if (!isUndoOrRedoInProgress && s != null && previousText != null && s.toString() != previousText) {
              saveUndoState()
            }
            
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
    
    // Remove child if it already has a parent
    if (editText.parent != null) {
      (editText.parent as ViewGroup).removeView(editText)
    }
    
    addView(editText)
  }

  fun setContent(content: String) {
    post {
      try {
        // Flag to prevent adding to undo stack during content setting
        isUndoOrRedoInProgress = true
        
        val spanned = if (content.contains("<") && content.contains(">")) {
          // Handle HTML content with better parsing
          Html.fromHtml(content, Html.FROM_HTML_MODE_LEGACY, null, createTagHandler())
        } else {
          SpannableString(content)
        }
        
        // Always use EDITABLE buffer type to ensure spans work properly
        val editableText = SpannableStringBuilder(spanned)
        editText.setText(editableText, TextView.BufferType.EDITABLE)
        
        // Reset undo/redo stacks when content is explicitly set
        undoStack.clear()
        redoStack.clear()
        
        // Save initial state to undo stack
        undoStack.push(SpannableStringBuilder(editableText))
        lastSavedHash = editableText.toString().hashCode()
        
        android.util.Log.d("ExpoRTEView", "Content set and undo stack initialized")
      } catch (e: Exception) {
        android.util.Log.e("ExpoRTEView", "Error setting content: ${e.message}")
        // Fallback to plain text with proper buffer type
        val fallbackText = SpannableStringBuilder(content)
        editText.setText(fallbackText, TextView.BufferType.EDITABLE)
      } finally {
        isUndoOrRedoInProgress = false
      }
    }
  }

  private fun createTagHandler(): Html.TagHandler {
    return Html.TagHandler { opening, tag, output, xmlReader ->
      // Handle custom tags if needed
      when (tag.lowercase()) {
        "li" -> {
          if (opening) {
            // Add bullet point for list items
            val start = output.length
            output.append("• ")
            output.setSpan(BulletSpan(40), start, output.length, Spannable.SPAN_EXCLUSIVE_INCLUSIVE)
          }
        }
      }
    }
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
      try {
        val start = editText.selectionStart
        val end = editText.selectionEnd
        
        android.util.Log.d("ExpoRTEView", "Formatting: type=$type, start=$start, end=$end, value=$value")
        
        // Save state for undo before making changes
        saveUndoStateForFormatting()
        
        // Ensure we have a proper Editable for span operations
        val editable = editText.text
        if (editable !is Editable) {
          val spannableBuilder = SpannableStringBuilder(editable)
          editText.setText(spannableBuilder, TextView.BufferType.EDITABLE)
        }
        
        val spannable = editText.text as Editable
        
        // If there's a selection, apply formatting to it
        if (start != end && start >= 0 && end <= spannable.length) {
          when (type) {
            "bold" -> toggleBoldFormatting(spannable, start, end)
            "italic" -> toggleItalicFormatting(spannable, start, end)
            "underline" -> toggleUnderlineFormatting(spannable, start, end)
            "strikethrough" -> toggleStrikethroughFormatting(spannable, start, end)
            "bullet" -> applyBulletFormatting(spannable, start, end)
            "numbered" -> applyNumberedFormatting(spannable, start, end)
            "link" -> {
              val url = value?.toString() ?: "http://example.com"
              applyLinkFormatting(spannable, start, end, url)
            }
          }
          // Keep selection after formatting
          editText.setSelection(start, end)
        } else if (start >= 0 && start <= spannable.length) {
          // No selection - insert sample text with formatting applied
          insertFormattedText(spannable, start, type, value)
        }
      } catch (e: Exception) {
        // Log the error but don't crash
        android.util.Log.e("ExpoRTEView", "Error formatting text: ${e.message}")
      }
    }
  }

  private fun toggleBoldFormatting(spannable: Editable, start: Int, end: Int) {
    // Check if text is already bold - check spans that overlap with our selection
    val existingBoldSpans = spannable.getSpans(start, end, StyleSpan::class.java)
      .filter { span ->
        val spanStart = spannable.getSpanStart(span)
        val spanEnd = spannable.getSpanEnd(span)
        // Only consider spans that actually overlap with our selection
        (spanStart < end && spanEnd > start) && 
        (span.style == Typeface.BOLD || span.style == Typeface.BOLD_ITALIC)
      }
    
    android.util.Log.d("ExpoRTEView", "Found ${existingBoldSpans.size} existing bold spans")
    
    if (existingBoldSpans.isNotEmpty()) {
      // Remove bold formatting
      android.util.Log.d("ExpoRTEView", "Removing bold formatting")
      existingBoldSpans.forEach { span ->
        val spanStart = spannable.getSpanStart(span)
        val spanEnd = spannable.getSpanEnd(span)
        spannable.removeSpan(span)
        
        // If it was bold+italic, keep just italic
        if (span.style == Typeface.BOLD_ITALIC) {
          spannable.setSpan(StyleSpan(Typeface.ITALIC), spanStart, spanEnd, Spannable.SPAN_INCLUSIVE_INCLUSIVE)
        }
      }
    } else {
      // Check if there's existing italic formatting
      val existingItalicSpans = spannable.getSpans(start, end, StyleSpan::class.java)
        .filter { it.style == Typeface.ITALIC }
      
      if (existingItalicSpans.isNotEmpty()) {
        // Upgrade to bold+italic
        existingItalicSpans.forEach { span ->
          val spanStart = spannable.getSpanStart(span)
          val spanEnd = spannable.getSpanEnd(span)
          spannable.removeSpan(span)
          spannable.setSpan(StyleSpan(Typeface.BOLD_ITALIC), spanStart, spanEnd, Spannable.SPAN_EXCLUSIVE_INCLUSIVE)
        }
      } else {
        // Apply bold formatting
        android.util.Log.d("ExpoRTEView", "Applying bold formatting")
        spannable.setSpan(StyleSpan(Typeface.BOLD), start, end, Spannable.SPAN_EXCLUSIVE_INCLUSIVE)
      }
    }
  }

  private fun toggleItalicFormatting(spannable: Editable, start: Int, end: Int) {
    // Check if text is already italic - check spans that overlap with our selection  
    val existingItalicSpans = spannable.getSpans(start, end, StyleSpan::class.java)
      .filter { span ->
        val spanStart = spannable.getSpanStart(span)
        val spanEnd = spannable.getSpanEnd(span)
        // Only consider spans that actually overlap with our selection
        (spanStart < end && spanEnd > start) && 
        (span.style == Typeface.ITALIC || span.style == Typeface.BOLD_ITALIC)
      }
    
    if (existingItalicSpans.isNotEmpty()) {
      // Remove italic formatting
      existingItalicSpans.forEach { span ->
        val spanStart = spannable.getSpanStart(span)
        val spanEnd = spannable.getSpanEnd(span)
        spannable.removeSpan(span)
        
        // If it was bold+italic, keep just bold
        if (span.style == Typeface.BOLD_ITALIC) {
          spannable.setSpan(StyleSpan(Typeface.BOLD), spanStart, spanEnd, Spannable.SPAN_EXCLUSIVE_INCLUSIVE)
        }
      }
    } else {
      // Check if there's existing bold formatting
      val existingBoldSpans = spannable.getSpans(start, end, StyleSpan::class.java)
        .filter { it.style == Typeface.BOLD }
      
      if (existingBoldSpans.isNotEmpty()) {
        // Upgrade to bold+italic
        existingBoldSpans.forEach { span ->
          val spanStart = spannable.getSpanStart(span)
          val spanEnd = spannable.getSpanEnd(span)
          spannable.removeSpan(span)
          spannable.setSpan(StyleSpan(Typeface.BOLD_ITALIC), spanStart, spanEnd, Spannable.SPAN_EXCLUSIVE_INCLUSIVE)
        }
      } else {
        // Apply italic formatting
        spannable.setSpan(StyleSpan(Typeface.ITALIC), start, end, Spannable.SPAN_EXCLUSIVE_INCLUSIVE)
      }
    }
  }

  private fun toggleUnderlineFormatting(spannable: Editable, start: Int, end: Int) {
    val existingSpans = spannable.getSpans(start, end, UnderlineSpan::class.java)
    
    if (existingSpans.isNotEmpty()) {
      // Remove underline formatting
      existingSpans.forEach { spannable.removeSpan(it) }
    } else {
      // Apply underline formatting
      spannable.setSpan(UnderlineSpan(), start, end, Spannable.SPAN_EXCLUSIVE_INCLUSIVE)
    }
  }

  private fun toggleStrikethroughFormatting(spannable: Editable, start: Int, end: Int) {
    val existingSpans = spannable.getSpans(start, end, StrikethroughSpan::class.java)
    
    if (existingSpans.isNotEmpty()) {
      // Remove strikethrough formatting
      existingSpans.forEach { spannable.removeSpan(it) }
    } else {
      // Apply strikethrough formatting
      spannable.setSpan(StrikethroughSpan(), start, end, Spannable.SPAN_EXCLUSIVE_INCLUSIVE)
    }
  }

  private fun applyBulletFormatting(spannable: Editable, start: Int, end: Int) {
    // Find the start of the line containing the selection
    var lineStart = start
    while (lineStart > 0 && spannable[lineStart - 1] != '\n') {
      lineStart--
    }
    
    // Find the end of the line containing the selection
    var lineEnd = end
    while (lineEnd < spannable.length && spannable[lineEnd] != '\n') {
      lineEnd++
    }
    
    // Check if the line already has a bullet
    val existingBulletSpans = spannable.getSpans(lineStart, lineEnd, BulletSpan::class.java)
    
    if (existingBulletSpans.isNotEmpty()) {
      // Remove bullet formatting
      existingBulletSpans.forEach { spannable.removeSpan(it) }
    } else {
      // Apply bullet formatting to the entire line
      val bulletSpan = BulletSpan(40) // 40px gap
      spannable.setSpan(bulletSpan, lineStart, lineEnd, Spannable.SPAN_EXCLUSIVE_INCLUSIVE)
    }
  }

  private fun applyNumberedFormatting(spannable: Editable, start: Int, end: Int) {
    // Find the start of the line containing the selection
    var lineStart = start
    while (lineStart > 0 && spannable[lineStart - 1] != '\n') {
      lineStart--
    }
    
    // Find the end of the line containing the selection
    var lineEnd = end
    while (lineEnd < spannable.length && spannable[lineEnd] != '\n') {
      lineEnd++
    }
    
    // Simple numbered list implementation
    // In a more advanced implementation, you'd track list numbers across multiple lines
    val lineText = spannable.subSequence(lineStart, lineEnd).toString()
    val numberPattern = Regex("^\\d+\\. ")
    
    if (numberPattern.containsMatchIn(lineText)) {
      // Remove existing number
      val match = numberPattern.find(lineText)
      if (match != null) {
        spannable.delete(lineStart, lineStart + match.value.length)
      }
    } else {
      // Add number (for simplicity, always use "1. ")
      // In a full implementation, you'd calculate the correct number
      spannable.insert(lineStart, "1. ")
    }
  }

  private fun applyLinkFormatting(spannable: Editable, start: Int, end: Int, url: String) {
    // Remove existing link spans in the range
    val existingLinkSpans = spannable.getSpans(start, end, URLSpan::class.java)
    existingLinkSpans.forEach { spannable.removeSpan(it) }
    
    // Apply new link formatting
    val urlSpan = URLSpan(url)
    spannable.setSpan(urlSpan, start, end, Spannable.SPAN_EXCLUSIVE_INCLUSIVE)
  }

  private fun insertFormattedText(spannable: Editable, position: Int, type: String, value: Any?) {
    val sampleText = when (type) {
      "bold" -> "Bold text"
      "italic" -> "Italic text"
      "underline" -> "Underlined text"
      "strikethrough" -> "Strikethrough text"
      "bullet" -> "• Bullet point"
      "numbered" -> "1. Numbered item"
      "link" -> "Link text"
      else -> "Formatted text"
    }
    
    val formattedSpan = SpannableString(sampleText)
    
    when (type) {
      "bold" -> formattedSpan.setSpan(StyleSpan(Typeface.BOLD), 0, sampleText.length, Spannable.SPAN_EXCLUSIVE_INCLUSIVE)
      "italic" -> formattedSpan.setSpan(StyleSpan(Typeface.ITALIC), 0, sampleText.length, Spannable.SPAN_EXCLUSIVE_INCLUSIVE)
      "underline" -> formattedSpan.setSpan(UnderlineSpan(), 0, sampleText.length, Spannable.SPAN_EXCLUSIVE_INCLUSIVE)
      "strikethrough" -> formattedSpan.setSpan(StrikethroughSpan(), 0, sampleText.length, Spannable.SPAN_EXCLUSIVE_INCLUSIVE)
      "bullet" -> formattedSpan.setSpan(BulletSpan(40), 0, sampleText.length, Spannable.SPAN_EXCLUSIVE_INCLUSIVE)
      "numbered" -> {
        // For numbered items, don't add a span but just insert the formatted text
      }
      "link" -> {
        val url = value?.toString() ?: "http://example.com"
        formattedSpan.setSpan(URLSpan(url), 0, sampleText.length, Spannable.SPAN_EXCLUSIVE_INCLUSIVE)
      }
    }
    
    spannable.insert(position, formattedSpan)
    editText.setSelection(position + sampleText.length)
  }

  fun undo() {
    post {
      if (undoStack.isNotEmpty()) {
        try {
          isUndoOrRedoInProgress = true
          
          // Save current text to redo stack
          val currentText = editText.text
          val currentSelection = editText.selectionStart
          
          // Don't undo if we only have one state left (initial state)
          if (undoStack.size == 1) {
            android.util.Log.d("ExpoRTEView", "Only initial state left, nothing to undo")
            return@post
          }
          
          redoStack.push(SpannableStringBuilder(currentText))
          
          // Get previous text from undo stack
          val previousText = undoStack.pop()
          editText.setText(previousText)
          
          // Try to preserve selection, but ensure it's within bounds
          val maxLength = previousText.length
          val newSelection = Math.min(currentSelection, maxLength)
          editText.setSelection(newSelection)
          
          // Update hash code to prevent duplicate states
          lastSavedHash = previousText.toString().hashCode()
          
          android.util.Log.d("ExpoRTEView", "Undo performed. Remaining undo states: ${undoStack.size}")
        } finally {
          isUndoOrRedoInProgress = false
        }
      } else {
        android.util.Log.d("ExpoRTEView", "No undo states available")
      }
    }
  }

  fun redo() {
    post {
      if (redoStack.isNotEmpty()) {
        try {
          isUndoOrRedoInProgress = true
          
          // Save current text to undo stack
          val currentText = editText.text
          val currentSelection = editText.selectionStart
          
          undoStack.push(SpannableStringBuilder(currentText))
          
          // Get next text from redo stack
          val nextText = redoStack.pop()
          editText.setText(nextText)
          
          // Try to preserve selection, but ensure it's within bounds
          val maxLength = nextText.length
          val newSelection = Math.min(currentSelection, maxLength)
          editText.setSelection(newSelection)
          
          // Update hash code to prevent duplicate states
          lastSavedHash = nextText.toString().hashCode()
          
          android.util.Log.d("ExpoRTEView", "Redo performed. Remaining redo states: ${redoStack.size}")
        } finally {
          isUndoOrRedoInProgress = false
        }
      } else {
        android.util.Log.d("ExpoRTEView", "No redo states available")
      }
    }
  }

  fun getCurrentFormats(): Map<String, Boolean> {
    val start = editText.selectionStart
    val end = editText.selectionEnd
    
    // If no selection, return all false
    if (start == end || start < 0 || end < 0) {
      return mapOf(
        "bold" to false,
        "italic" to false,
        "underline" to false,
        "strikethrough" to false,
        "bullet" to false,
        "numbered" to false
      )
    }
    
    val spannable = editText.text as? Spanned ?: return mapOf(
      "bold" to false,
      "italic" to false,
      "underline" to false,
      "strikethrough" to false,
      "bullet" to false,
      "numbered" to false
    )
    
    // Check for bold formatting
    val boldSpans = spannable.getSpans(start, end, StyleSpan::class.java)
      .filter { span ->
        val spanStart = spannable.getSpanStart(span)
        val spanEnd = spannable.getSpanEnd(span)
        (spanStart < end && spanEnd > start) && 
        (span.style == Typeface.BOLD || span.style == Typeface.BOLD_ITALIC)
      }
    
    // Check for italic formatting
    val italicSpans = spannable.getSpans(start, end, StyleSpan::class.java)
      .filter { span ->
        val spanStart = spannable.getSpanStart(span)
        val spanEnd = spannable.getSpanEnd(span)
        (spanStart < end && spanEnd > start) && 
        (span.style == Typeface.ITALIC || span.style == Typeface.BOLD_ITALIC)
      }
    
    // Check for underline formatting
    val underlineSpans = spannable.getSpans(start, end, UnderlineSpan::class.java)
      .filter { span ->
        val spanStart = spannable.getSpanStart(span)
        val spanEnd = spannable.getSpanEnd(span)
        (spanStart < end && spanEnd > start)
      }
    
    // Check for strikethrough formatting
    val strikethroughSpans = spannable.getSpans(start, end, StrikethroughSpan::class.java)
      .filter { span ->
        val spanStart = spannable.getSpanStart(span)
        val spanEnd = spannable.getSpanEnd(span)
        (spanStart < end && spanEnd > start)
      }
    
    // Check for bullet formatting
    val bulletSpans = spannable.getSpans(start, end, BulletSpan::class.java)
      .filter { span ->
        val spanStart = spannable.getSpanStart(span)
        val spanEnd = spannable.getSpanEnd(span)
        (spanStart < end && spanEnd > start)
      }
    
    // Check for numbered formatting (simplified check)
    val lineText = spannable.subSequence(start, end).toString()
    val hasNumberedFormat = Regex("^\\d+\\. ").containsMatchIn(lineText)
    
    return mapOf(
      "bold" to boldSpans.isNotEmpty(),
      "italic" to italicSpans.isNotEmpty(),
      "underline" to underlineSpans.isNotEmpty(),
      "strikethrough" to strikethroughSpans.isNotEmpty(),
      "bullet" to bulletSpans.isNotEmpty(),
      "numbered" to hasNumberedFormat
    )
  }

  private fun saveUndoState() {
    if (isUndoOrRedoInProgress) return
    
    val currentText = editText.text
    if (currentText != null) {
      // Don't save duplicate states
      val currentHash = currentText.toString().hashCode()
      if (currentHash == lastSavedHash && undoStack.isNotEmpty()) {
        return
      }
      
      undoStack.push(SpannableStringBuilder(currentText))
      redoStack.clear() // Clear redo stack when new action is performed
      lastSavedHash = currentHash
      
      // Limit undo stack size
      if (undoStack.size > 50) {
        undoStack.removeElementAt(0)
      }
      
      android.util.Log.d("ExpoRTEView", "Saved undo state. Stack size: ${undoStack.size}")
    }
  }
  
  private fun saveUndoStateForFormatting() {
    if (isUndoOrRedoInProgress) return
    
    val currentText = editText.text
    if (currentText != null) {
      // Always save state before formatting, regardless of duplication
      undoStack.push(SpannableStringBuilder(currentText))
      redoStack.clear() // Clear redo stack when new action is performed
      lastSavedHash = currentText.toString().hashCode()
      
      // Limit undo stack size
      if (undoStack.size > 50) {
        undoStack.removeElementAt(0)
      }
      
      android.util.Log.d("ExpoRTEView", "Saved undo state for formatting. Stack size: ${undoStack.size}")
    }
  }

  private fun getHtmlContent(): String {
    val spanned = editText.text as? Spanned ?: return editText.text.toString()
    
    try {
      android.util.Log.d("ExpoRTEView", "Converting text to HTML. Text length: ${spanned.length}")
      
      // Debug: Log all spans in the text
      val allSpans = spanned.getSpans(0, spanned.length, Any::class.java)
      android.util.Log.d("ExpoRTEView", "Found ${allSpans.size} spans in text")
      allSpans.forEach { span ->
        val start = spanned.getSpanStart(span)
        val end = spanned.getSpanEnd(span)
        android.util.Log.d("ExpoRTEView", "Span: ${span.javaClass.simpleName} from $start to $end")
      }
      
      var html = Html.toHtml(spanned, Html.TO_HTML_PARAGRAPH_LINES_CONSECUTIVE)
      
      // Clean up the HTML output for better consistency
      html = html.replace(Regex("<p dir=\"ltr\">"), "<p>")
      html = html.replace(Regex("<p dir=\"rtl\">"), "<p>")
      html = html.replace(Regex("</p>\n<p>"), "</p><p>")
      
      // Ensure proper paragraph wrapping
      if (!html.startsWith("<p>") && html.isNotEmpty()) {
        html = "<p>$html</p>"
      }
      
      android.util.Log.d("ExpoRTEView", "Generated HTML: $html")
      return html
    } catch (e: Exception) {
      android.util.Log.e("ExpoRTEView", "Error converting to HTML: ${e.message}")
      return editText.text.toString()
    }
  }
}
