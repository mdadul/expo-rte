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
}
