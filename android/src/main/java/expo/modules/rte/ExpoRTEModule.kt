package expo.modules.rte

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoRTEModule : Module() {
  init {
    ExpoRTEView.moduleInstance = this
  }

  override fun definition() = ModuleDefinition {
    Name("ExpoRTE")

    Events("onChange")

    // Set content in the current focused RTE view
    AsyncFunction("setContent") { content: String ->
      getCurrentRTEView()?.setContent(content)
    }

    // Get content from the current focused RTE view
    AsyncFunction("getContent") { ->
      getCurrentRTEView()?.getContent() ?: ""
    }

    // Apply formatting to selected text
    AsyncFunction("format") { type: String, value: Any? ->
      getCurrentRTEView()?.format(type, value)
    }

    // Insert image into the editor
    AsyncFunction("insertImage") { uri: String, width: Int?, height: Int? ->
      getCurrentRTEView()?.insertImage(uri, width, height)
    }

    // Undo last action
    AsyncFunction("undo") { ->
      getCurrentRTEView()?.undo()
    }

    // Redo last undone action
    AsyncFunction("redo") { ->
      getCurrentRTEView()?.redo()
    }

    // Enables the module to be used as a native view
    View(ExpoRTEView::class) {
      // Content prop to set initial content
      Prop("content") { view: ExpoRTEView, content: String? ->
        content?.let { view.setContent(it) }
      }

      // Placeholder prop
      Prop("placeholder") { view: ExpoRTEView, placeholder: String? ->
        view.setPlaceholder(placeholder ?: "")
      }

      // Editable prop
      Prop("editable") { view: ExpoRTEView, editable: Boolean ->
        view.setEditable(editable)
      }
    }
  }

  private fun getCurrentRTEView(): ExpoRTEView? {
    return ExpoRTEView.currentFocusedView
  }
}
