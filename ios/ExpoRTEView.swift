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
      guard self.textView.selectedTextRange != nil else { return }
      let nsRange = self.textView.selectedRange
      
      if nsRange.length == 0 { return } // No selection
      
      let mutableString = NSMutableAttributedString(attributedString: self.textView.attributedText)
      
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
      
      self.textView.attributedText = mutableString
    }
  }
  
  func insertImage(uri: String, width: Int?, height: Int?) {
    DispatchQueue.main.async {
      // For now, insert a placeholder text for the image
      // In a real implementation, you would load the image asynchronously
      let imageText = "[Image: \(uri)]"
      self.textView.insertText(imageText)
    }
  }
  
  func undo() {
    DispatchQueue.main.async {
      if !self.undoStack.isEmpty {
        let currentText = self.textView.attributedText
        self.redoStack.append(currentText!)
        let previousText = self.undoStack.removeLast()
        self.textView.attributedText = previousText
      }
    }
  }
  
  func redo() {
    DispatchQueue.main.async {
      if !self.redoStack.isEmpty {
        let currentText = self.textView.attributedText
        self.undoStack.append(currentText!)
        let nextText = self.redoStack.removeLast()
        self.textView.attributedText = nextText
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
}

extension ExpoRTEView: UITextViewDelegate {
  func textViewDidBeginEditing(_ textView: UITextView) {
    ExpoRTEView.currentFocusedView = self
  }
  
  func textViewDidChange(_ textView: UITextView) {
    saveUndoState()
    DispatchQueue.main.async {
      if let moduleInstance = ExpoRTEView.moduleInstance {
        moduleInstance.sendEvent("onChange", ["content": self.getContent()])
      }
    }
  }
}
