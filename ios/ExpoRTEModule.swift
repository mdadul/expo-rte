import ExpoModulesCore

public class ExpoRTEModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoRTE")

    // Defines event names that the module can send to JavaScript.
    Events("onChange")

    // Set content in the current focused RTE view
    AsyncFunction("setContent") { (content: String) in
      ExpoRTEView.currentFocusedView?.setContent(content)
    }

    // Get content from the current focused RTE view
    AsyncFunction("getContent") { () -> String in
      return ExpoRTEView.currentFocusedView?.getContent() ?? ""
    }

    // Apply formatting to selected text
    AsyncFunction("format") { (type: String, value: String?) in
      ExpoRTEView.currentFocusedView?.format(type: type, value: value)
    }

    // Insert image into the editor
    AsyncFunction("insertImage") { (uri: String, width: Int?, height: Int?) in
      ExpoRTEView.currentFocusedView?.insertImage(uri: uri, width: width, height: height)
    }

    // Undo last action
    AsyncFunction("undo") { () in
      ExpoRTEView.currentFocusedView?.undo()
    }

    // Redo last undone action
    AsyncFunction("redo") { () in
      ExpoRTEView.currentFocusedView?.redo()
    }

    // Enables the module to be used as a native view
    View(ExpoRTEView.self) {
      // Content prop to set initial content
      Prop("content") { (view: ExpoRTEView, content: String?) in
        if let content = content {
          view.setContent(content)
        }
      }

      // Placeholder prop
      Prop("placeholder") { (view: ExpoRTEView, placeholder: String?) in
        view.setPlaceholder(placeholder ?? "")
      }

      // Editable prop
      Prop("editable") { (view: ExpoRTEView, editable: Bool) in
        view.setEditable(editable)
      }

      // Content change event
      Events("onChange")
    }
  }
}
