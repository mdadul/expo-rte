import ExpoModulesCore
import UIKit

class ExpoRTEView: ExpoView {
  static var currentFocusedView: ExpoRTEView?
  
  let onChange = EventDispatcher()
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
          textView.attributedText = attributedString
        } catch {
          textView.text = content
        }
      }
    } else {
      textView.text = content
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
    // UITextView doesn't have built-in placeholder, but we can simulate it
    if textView.text.isEmpty {
      textView.text = placeholder
      textView.textColor = UIColor.placeholderText
    }
  }
  
  func setEditable(_ editable: Bool) {
    textView.isEditable = editable
  }
  
  func format(type: String, value: String?) {
    guard let selectedRange = textView.selectedTextRange else { return }
    let nsRange = textView.selectedRange
    
    if nsRange.length == 0 { return } // No selection
    
    let mutableString = NSMutableAttributedString(attributedString: textView.attributedText)
    
    switch type {
    case "bold":
      mutableString.addAttribute(.font, value: UIFont.boldSystemFont(ofSize: 16), range: nsRange)
    case "italic":
      mutableString.addAttribute(.font, value: UIFont.italicSystemFont(ofSize: 16), range: nsRange)
    case "underline":
      mutableString.addAttribute(.underlineStyle, value: NSUnderlineStyle.single.rawValue, range: nsRange)
    case "strikethrough":
      mutableString.addAttribute(.strikethroughStyle, value: NSUnderlineStyle.single.rawValue, range: nsRange)
    case "link":
      if let urlString = value, let url = URL(string: urlString) {
        mutableString.addAttribute(.link, value: url, range: nsRange)
      }
    default:
      break
    }
    
    textView.attributedText = mutableString
  }
  
  func insertImage(uri: String, width: Int?, height: Int?) {
    // For now, insert a placeholder text for the image
    // In a real implementation, you would load the image asynchronously
    let imageText = "[Image: \(uri)]"
    textView.insertText(imageText)
  }
  
  func undo() {
    if !undoStack.isEmpty {
      let currentText = textView.attributedText
      redoStack.append(currentText!)
      let previousText = undoStack.removeLast()
      textView.attributedText = previousText
    }
  }
  
  func redo() {
    if !redoStack.isEmpty {
      let currentText = textView.attributedText
      undoStack.append(currentText!)
      let nextText = redoStack.removeLast()
      textView.attributedText = nextText
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
}

extension ExpoRTEView: UITextViewDelegate {
  func textViewDidBeginEditing(_ textView: UITextView) {
    ExpoRTEView.currentFocusedView = self
  }
  
  func textViewDidChange(_ textView: UITextView) {
    saveUndoState()
    onChange(["content": getContent()])
  }
}
