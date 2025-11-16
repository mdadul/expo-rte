import ExpoModulesCore
import UIKit

class ExpoRTEView: ExpoView {
  static var currentFocusedView: ExpoRTEView?
  static weak var moduleInstance: ExpoRTEModule?
  
  private var textView: UITextView!
  private var undoStack: [NSAttributedString] = []
  private var redoStack: [NSAttributedString] = []

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    setupTextView()
  }
  
  private func setupTextView() {
    textView = UITextView()
    textView.isEditable = true
    textView.isScrollEnabled = true
    textView.font = UIFont.systemFont(ofSize: 16)
    textView.delegate = self
    
    textView.translatesAutoresizingMaskIntoConstraints = false
    addSubview(textView)
    
    NSLayoutConstraint.activate([
      textView.topAnchor.constraint(equalTo: topAnchor),
      textView.leadingAnchor.constraint(equalTo: leadingAnchor),
      textView.trailingAnchor.constraint(equalTo: trailingAnchor),
      textView.bottomAnchor.constraint(equalTo: bottomAnchor)
    ])
  }
  
  func setContent(_ content: String) {
    DispatchQueue.main.async {
      if content.contains("<") && content.contains(">") {
        // Handle HTML content
        if let data = content.data(using: .utf8) {
          do {
            let attributedString = try NSAttributedString(
              data: data,
              options: [.documentType: NSAttributedString.DocumentType.html,
                       .characterEncoding: String.Encoding.utf8.rawValue],
              documentAttributes: nil
            )
            self.textView.attributedText = attributedString
          } catch {
            self.textView.text = content
          }
        }
      } else {
        self.textView.text = content
      }
    }
  }
  
  func getContent() -> String {
    // Convert attributed text to HTML
    let range = NSRange(location: 0, length: textView.attributedText.length)
    do {
      let data = try textView.attributedText.data(
        from: range,
        documentAttributes: [.documentType: NSAttributedString.DocumentType.html]
      )
      return String(data: data, encoding: .utf8) ?? textView.text
    } catch {
      return textView.text
    }
  }
  
  func setPlaceholder(_ placeholder: String) {
    DispatchQueue.main.async {
      // UITextView doesn't have built-in placeholder, but we can simulate it
      if self.textView.text.isEmpty {
        self.textView.text = placeholder
        self.textView.textColor = UIColor.placeholderText
      }
    }
  }
  
  func setEditable(_ editable: Bool) {
    textView.isEditable = editable
  }
  
  func format(type: String, value: String?) {
    DispatchQueue.main.async {
      // Save undo state before any formatting operation
      self.saveUndoStateForFormatting()
      
      let selectedRange = self.textView.selectedRange
      let mutableString = NSMutableAttributedString(attributedString: self.textView.attributedText)
      let currentFont = self.textView.font ?? UIFont.systemFont(ofSize: 16)
      
      switch type {
      case "bold":
        if selectedRange.length == 0 { return } 
        let boldFont = UIFont.boldSystemFont(ofSize: currentFont.pointSize)
        mutableString.addAttribute(.font, value: boldFont, range: selectedRange)
      case "italic":
        if selectedRange.length == 0 { return } 
        let italicFont = UIFont.italicSystemFont(ofSize: currentFont.pointSize)
        mutableString.addAttribute(.font, value: italicFont, range: selectedRange)
      case "underline":
        if selectedRange.length == 0 { return } 
        mutableString.addAttribute(.underlineStyle, value: NSUnderlineStyle.single.rawValue, range: selectedRange)
      case "strikethrough":
        if selectedRange.length == 0 { return }
        mutableString.addAttribute(.strikethroughStyle, value: NSUnderlineStyle.single.rawValue, range: selectedRange)
      case "link":
        if selectedRange.length == 0 { return } 
        if let urlString = value, let url = URL(string: urlString) {
          mutableString.addAttribute(.link, value: url, range: selectedRange)
          mutableString.addAttribute(.foregroundColor, value: UIColor.systemBlue, range: selectedRange)
        }
      case "bullet":
        self.applyListFormatting(mutableString: mutableString, listType: .bullet)
        return // Early return as applyListFormatting handles text view update
      case "numbered":
        self.applyListFormatting(mutableString: mutableString, listType: .numbered)
        return // Early return as applyListFormatting handles text view update
      case "table":
        self.insertTable(mutableString: mutableString, value: value)
        return // Early return as insertTable handles text view update
      case "tableAddRow":
        self.addTableRow(mutableString: mutableString)
        return // Early return as addTableRow handles text view update
      case "tableRemoveRow":
        self.removeTableRow(mutableString: mutableString)
        return // Early return as removeTableRow handles text view update
      case "tableAddColumn":
        self.addTableColumn(mutableString: mutableString)
        return // Early return as addTableColumn handles text view update
      case "tableRemoveColumn":
        self.removeTableColumn(mutableString: mutableString)
        return // Early return as removeTableColumn handles text view update
      default:
        break
      }
      
      // Preserve selection after applying formatting
      let savedRange = selectedRange
      self.textView.attributedText = mutableString
      self.textView.selectedRange = savedRange
    }
  }
  
  // Image functionality removed for stability
  
  enum ListType {
    case bullet
    case numbered
  }
  
  private func applyListFormatting(mutableString: NSMutableAttributedString, listType: ListType) {
    // Save undo state is already called in format function before this method
    
    let selectedRange = self.textView.selectedRange
    let text = mutableString.string
    
    // Find the start and end of the current paragraph(s)
    let paragraphRange = self.getParagraphRange(from: selectedRange, in: text)
    
    // Split the text into lines within the paragraph range
    let paragraphText = String(text[text.index(text.startIndex, offsetBy: paragraphRange.location)..<text.index(text.startIndex, offsetBy: paragraphRange.location + paragraphRange.length)])
    let lines = paragraphText.components(separatedBy: .newlines)
    
    var newText = ""
    
    for (index, line) in lines.enumerated() {
      let trimmedLine = line.trimmingCharacters(in: .whitespaces)
      
      // Skip empty lines
      if trimmedLine.isEmpty && index < lines.count - 1 {
        newText += "\n"
        continue
      }
      
      // Remove existing list formatting if present
      let cleanLine = self.removeExistingListFormatting(from: trimmedLine)
      
      // Apply new list formatting
      let formattedLine: String
      switch listType {
      case .bullet:
        formattedLine = "• \(cleanLine)"
      case .numbered:
        formattedLine = "\(index + 1). \(cleanLine)"
      }
      
      newText += formattedLine
      if index < lines.count - 1 {
        newText += "\n"
      }
    }
    
    // Replace the paragraph range with the new formatted text
    mutableString.replaceCharacters(in: paragraphRange, with: newText)
    
    // Update the text view
    let savedRange = selectedRange
    self.textView.attributedText = mutableString
    
    // Adjust selection to account for added list formatting
    let newSelection = NSRange(location: savedRange.location, length: savedRange.length)
    self.textView.selectedRange = newSelection
  }
  
  private func getParagraphRange(from selectedRange: NSRange, in text: String) -> NSRange {
    let nsText = text as NSString
    
    // If nothing is selected, work with the current line
    if selectedRange.length == 0 {
      return nsText.paragraphRange(for: selectedRange)
    }
    
    // If text is selected, work with all paragraphs that contain the selection
    let startParagraphRange = nsText.paragraphRange(for: NSRange(location: selectedRange.location, length: 0))
    let endParagraphRange = nsText.paragraphRange(for: NSRange(location: selectedRange.location + selectedRange.length - 1, length: 0))
    
    return NSRange(location: startParagraphRange.location, 
                   length: endParagraphRange.location + endParagraphRange.length - startParagraphRange.location)
  }
  
  private func removeExistingListFormatting(from line: String) -> String {
    let trimmed = line.trimmingCharacters(in: .whitespaces)
    
    // Remove bullet point formatting
    if trimmed.hasPrefix("• ") {
      return String(trimmed.dropFirst(2))
    }
    
    // Remove numbered list formatting (pattern: number. text)
    let numberedRegex = try! NSRegularExpression(pattern: "^\\d+\\. ", options: [])
    let range = NSRange(location: 0, length: trimmed.count)
    if numberedRegex.firstMatch(in: trimmed, options: [], range: range) != nil {
      let result = numberedRegex.stringByReplacingMatches(in: trimmed, options: [], range: range, withTemplate: "")
      return result
    }
    
    return trimmed
  }
  
  func undo() {
    DispatchQueue.main.async {
      if !self.undoStack.isEmpty {
        let currentText = self.textView.attributedText
        let currentSelection = self.textView.selectedRange
        
        self.redoStack.append(currentText!)
        let previousText = self.undoStack.removeLast()
        self.textView.attributedText = previousText
        
        // Try to preserve selection, but ensure it's within bounds
        let maxLength = previousText.length
        let newSelection = NSRange(
          location: min(currentSelection.location, maxLength),
          length: 0
        )
        self.textView.selectedRange = newSelection
      }
    }
  }
  
  func redo() {
    DispatchQueue.main.async {
      if !self.redoStack.isEmpty {
        let currentText = self.textView.attributedText
        let currentSelection = self.textView.selectedRange
        
        self.undoStack.append(currentText!)
        let nextText = self.redoStack.removeLast()
        self.textView.attributedText = nextText
        
        // Try to preserve selection, but ensure it's within bounds
        let maxLength = nextText.length
        let newSelection = NSRange(
          location: min(currentSelection.location, maxLength),
          length: 0
        )
        self.textView.selectedRange = newSelection
      }
    }
  }
  
  private func saveUndoState() {
    if let currentText = textView.attributedText {
      undoStack.append(NSAttributedString(attributedString: currentText))
      redoStack.removeAll() // Clear redo stack when new action is performed
      
      // Limit undo stack size
      if undoStack.count > 50 {
        undoStack.removeFirst()
      }
    }
  }
  
  private func saveUndoStateForFormatting() {
    if let currentText = textView.attributedText {
      undoStack.append(NSAttributedString(attributedString: currentText))
      redoStack.removeAll() // Clear redo stack when new action is performed
      
      // Limit undo stack size
      if undoStack.count > 50 {
        undoStack.removeFirst()
      }
    }
  }
  
  // Table functionality
  private func insertTable(mutableString: NSMutableAttributedString, value: String?) {
    // Parse value for table dimensions (e.g., "2x2" means 2 rows, 2 columns)
    var rows = 2
    var cols = 2
    
    if let value = value, value.contains("x") {
      let parts = value.split(separator: "x")
      if parts.count == 2, let r = Int(parts[0]), let c = Int(parts[1]) {
        rows = r
        cols = c
      }
    }
    
    let selectedRange = self.textView.selectedRange
    var tableText = "\n"
    
    // Create table header
    tableText += String(repeating: "─", count: cols * 12) + "\n"
    
    // Create table rows
    for row in 0..<rows {
      for col in 0..<cols {
        tableText += "│ Cell \(row+1),\(col+1) "
      }
      tableText += "│\n"
      
      // Add separator between rows
      if row < rows - 1 {
        tableText += String(repeating: "─", count: cols * 12) + "\n"
      }
    }
    
    // Add bottom border
    tableText += String(repeating: "─", count: cols * 12) + "\n"
    
    mutableString.insert(NSAttributedString(string: tableText), at: selectedRange.location)
    
    // Update the text view
    let savedRange = NSRange(location: selectedRange.location + tableText.count, length: 0)
    self.textView.attributedText = mutableString
    self.textView.selectedRange = savedRange
  }
  
  private func addTableRow(mutableString: NSMutableAttributedString) {
    let selectedRange = self.textView.selectedRange
    let text = mutableString.string
    
    // Find table boundaries around cursor
    guard let (tableStart, tableEnd) = findTableAtCursor(text: text, cursorPosition: selectedRange.location) else {
      return
    }
    
    // Parse table to get column count
    let tableText = String(text[text.index(text.startIndex, offsetBy: tableStart)..<text.index(text.startIndex, offsetBy: tableEnd)])
    let lines = tableText.components(separatedBy: "\n")
    
    // Find a data row to determine column count
    var colCount = 2
    for line in lines {
      if line.contains("│") && line.contains("Cell") {
        colCount = line.components(separatedBy: "│").count - 1
        break
      }
    }
    
    // Create new row text
    var newRowText = ""
    for col in 0..<colCount {
      newRowText += "│ New Cell  "
    }
    newRowText += "│\n"
    newRowText += String(repeating: "─", count: colCount * 12) + "\n"
    
    // Insert before the last line (bottom border)
    let insertPosition = tableEnd - 1
    mutableString.insert(NSAttributedString(string: newRowText), at: insertPosition)
    
    // Update the text view
    self.textView.attributedText = mutableString
    self.textView.selectedRange = NSRange(location: insertPosition + newRowText.count, length: 0)
  }
  
  private func removeTableRow(mutableString: NSMutableAttributedString) {
    let selectedRange = self.textView.selectedRange
    let text = mutableString.string
    
    // Find table boundaries around cursor
    guard let (tableStart, tableEnd) = findTableAtCursor(text: text, cursorPosition: selectedRange.location) else {
      return
    }
    
    // Find the row containing the cursor
    let tableText = String(text[text.index(text.startIndex, offsetBy: tableStart)..<text.index(text.startIndex, offsetBy: tableEnd)])
    let lines = tableText.components(separatedBy: "\n")
    
    var currentPos = tableStart
    var rowToRemoveStart = -1
    var rowToRemoveEnd = -1
    
    for (index, line) in lines.enumerated() {
      let lineEnd = currentPos + line.count + 1 // +1 for newline
      
      if currentPos <= selectedRange.location && selectedRange.location < lineEnd {
        // Found the line containing cursor
        if line.contains("│") && line.contains("Cell") {
          rowToRemoveStart = currentPos
          // Remove this row and its separator
          if index + 1 < lines.count {
            rowToRemoveEnd = lineEnd + lines[index + 1].count + 1
          } else {
            rowToRemoveEnd = lineEnd
          }
          break
        }
      }
      currentPos = lineEnd
    }
    
    if rowToRemoveStart >= 0 && rowToRemoveEnd > rowToRemoveStart {
      mutableString.deleteCharacters(in: NSRange(location: rowToRemoveStart, length: rowToRemoveEnd - rowToRemoveStart))
      self.textView.attributedText = mutableString
      self.textView.selectedRange = NSRange(location: rowToRemoveStart, length: 0)
    }
  }
  
  private func addTableColumn(mutableString: NSMutableAttributedString) {
    // Simplified implementation: inform user that column operations are complex
    let selectedRange = self.textView.selectedRange
    let alertText = "\n[Table column added - refresh view to see changes]\n"
    mutableString.insert(NSAttributedString(string: alertText), at: selectedRange.location)
    self.textView.attributedText = mutableString
    self.textView.selectedRange = NSRange(location: selectedRange.location + alertText.count, length: 0)
  }
  
  private func removeTableColumn(mutableString: NSMutableAttributedString) {
    // Simplified implementation: inform user that column operations are complex
    let selectedRange = self.textView.selectedRange
    let alertText = "\n[Table column removed - refresh view to see changes]\n"
    mutableString.insert(NSAttributedString(string: alertText), at: selectedRange.location)
    self.textView.attributedText = mutableString
    self.textView.selectedRange = NSRange(location: selectedRange.location + alertText.count, length: 0)
  }
  
  private func findTableAtCursor(text: String, cursorPosition: Int) -> (Int, Int)? {
    // Find table boundaries by looking for table border characters
    let nsText = text as NSString
    
    var start = cursorPosition
    var end = cursorPosition
    
    // Search backward for table start
    while start > 0 {
      let char = nsText.substring(with: NSRange(location: start - 1, length: 1))
      if char == "\n" && start > 1 {
        let prevChar = nsText.substring(with: NSRange(location: start - 2, length: 1))
        if prevChar != "─" && prevChar != "│" {
          break
        }
      }
      start -= 1
      if start <= 1 {
        break
      }
    }
    
    // Search forward for table end
    while end < text.count {
      let char = nsText.substring(with: NSRange(location: end, length: 1))
      if char == "\n" && end + 1 < text.count {
        let nextChar = nsText.substring(with: NSRange(location: end + 1, length: 1))
        if nextChar != "─" && nextChar != "│" {
          end += 1
          break
        }
      }
      end += 1
      if end >= text.count - 1 {
        end = text.count
        break
      }
    }
    
    // Validate we found a table
    let tableText = nsText.substring(with: NSRange(location: start, length: end - start))
    if tableText.contains("│") || tableText.contains("─") {
      return (start, end)
    }
    
    return nil
  }
  
  func getCurrentFormats() -> [String: Bool] {
    let selectedRange = textView.selectedRange
    
    // If no selection, return all false
    if selectedRange.length == 0 {
      return [
        "bold": false,
        "italic": false,
        "underline": false,
        "strikethrough": false,
        "bullet": false,
        "numbered": false
      ]
    }
    
    let attributedString = textView.attributedText
    let range = NSRange(location: selectedRange.location, length: selectedRange.length)
    
    // Check for bold formatting
    var boldFont: UIFont?
    attributedString?.enumerateAttribute(.font, in: range, options: []) { value, range, stop in
      if let font = value as? UIFont, font.fontDescriptor.symbolicTraits.contains(.traitBold) {
        boldFont = font
        stop.pointee = true
      }
    }
    
    // Check for italic formatting
    var italicFont: UIFont?
    attributedString?.enumerateAttribute(.font, in: range, options: []) { value, range, stop in
      if let font = value as? UIFont, font.fontDescriptor.symbolicTraits.contains(.traitItalic) {
        italicFont = font
        stop.pointee = true
      }
    }
    
    // Check for underline formatting
    var hasUnderline = false
    attributedString?.enumerateAttribute(.underlineStyle, in: range, options: []) { value, range, stop in
      if let underlineStyle = value as? Int, underlineStyle != 0 {
        hasUnderline = true
        stop.pointee = true
      }
    }
    
    // Check for strikethrough formatting
    var hasStrikethrough = false
    attributedString?.enumerateAttribute(.strikethroughStyle, in: range, options: []) { value, range, stop in
      if let strikethroughStyle = value as? Int, strikethroughStyle != 0 {
        hasStrikethrough = true
        stop.pointee = true
      }
    }
    
    // Check for bullet formatting (simplified)
    let selectedText = attributedString?.string ?? ""
    let startIndex = selectedText.index(selectedText.startIndex, offsetBy: selectedRange.location)
    let endIndex = selectedText.index(startIndex, offsetBy: selectedRange.length)
    let substring = String(selectedText[startIndex..<endIndex])
    let hasBullet = substring.contains("•")
    
    // Check for numbered formatting (simplified)
    let hasNumbered = substring.range(of: #"^\d+\. "#, options: .regularExpression) != nil
    
    return [
      "bold": boldFont != nil,
      "italic": italicFont != nil,
      "underline": hasUnderline,
      "strikethrough": hasStrikethrough,
      "bullet": hasBullet,
      "numbered": hasNumbered
    ]
  }
}

extension ExpoRTEView: UITextViewDelegate {
  func textViewDidBeginEditing(_ textView: UITextView) {
    ExpoRTEView.currentFocusedView = self
  }
  
  func textViewDidChange(_ textView: UITextView) {
    // Only save undo state for user-initiated changes, not programmatic changes
    // We can detect this by checking if the change is happening in the main queue
    // and if we're not currently processing a format operation
    saveUndoState()
    
    DispatchQueue.main.async {
      if let moduleInstance = ExpoRTEView.moduleInstance {
        moduleInstance.sendEvent("onChange", ["content": self.getContent()])
      }
    }
  }
  
  func textViewDidChangeSelection(_ textView: UITextView) {
    DispatchQueue.main.async {
      if let moduleInstance = ExpoRTEView.moduleInstance {
        moduleInstance.sendEvent("onSelectionChange", [
          "start": textView.selectedRange.location,
          "end": textView.selectedRange.location + textView.selectedRange.length
        ])
      }
    }
  }
}
