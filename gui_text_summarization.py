import sys
from models import tfidf_model
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout,
    QLabel, QTextEdit, QPushButton, QComboBox,
    QTabWidget, QTableWidget, QTableWidgetItem,
    QHeaderView, QSplitter, QGraphicsDropShadowEffect
)
from PySide6.QtCore import Qt, QPropertyAnimation, QTimer
from PySide6.QtGui import QFont, QCursor, QPixmap

# ================= Splash Screen =================
class SplashScreen(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowFlags(Qt.FramelessWindowHint)
        self.setFixedSize(400, 300)

        layout = QVBoxLayout(self)
        layout.setAlignment(Qt.AlignCenter)

        self.logo = QLabel()
        pixmap = QPixmap("splash.png")
        self.logo.setPixmap(pixmap.scaled(150, 150, Qt.KeepAspectRatio))

        self.text = QLabel("Loading Summarizer...")
        self.text.setStyleSheet("color: white; font-size: 16px;")

        layout.addWidget(self.logo)
        layout.addWidget(self.text)

        self.setStyleSheet("background-color: #121212; border-radius: 15px;")


# ================= Loading Overlay =================
class LoadingOverlay(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setStyleSheet("background-color: rgba(0, 0, 0, 180);")

        layout = QVBoxLayout(self)
        layout.setAlignment(Qt.AlignCenter)

        self.label = QLabel("⏳ Processing...")
        self.label.setStyleSheet("""
            color: white;
            font-size: 18px;
            font-weight: bold;
        """)

        layout.addWidget(self.label)
        self.hide()


# ================= Main App =================
class SummarizerApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Professional NLP Summarization Tool")
        self.resize(1100, 650)

        font = QFont("Segoe UI", 10)
        self.setFont(font)

        self.init_ui()

    def init_ui(self):
        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        splitter = QSplitter(Qt.Horizontal)
        main_layout = QVBoxLayout(central_widget)
        main_layout.addWidget(splitter)

        # LEFT
        left_panel = QWidget()
        left_layout = QVBoxLayout(left_panel)

        left_layout.addWidget(QLabel("<b>Original Text:</b>"))

        self.input_text = QTextEdit()
        self.input_text.setPlaceholderText("Paste text here...")
        left_layout.addWidget(self.input_text)

        left_layout.addWidget(QLabel("<b>Select Model:</b>"))

        self.model_combo = QComboBox()
        self.model_combo.addItems([
            "TF-IDF",
            "Transformer"
        ])
        left_layout.addWidget(self.model_combo)

        self.btn = QPushButton("Generate Summary")
        self.btn.setMinimumHeight(45)
        self.btn.clicked.connect(self.process)

        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(25)
        shadow.setOffset(0, 6)
        self.btn.setGraphicsEffect(shadow)

        left_layout.addWidget(self.btn)

        # RIGHT
        right_panel = QWidget()
        right_layout = QVBoxLayout(right_panel)

        self.tabs = QTabWidget()

        self.output = QTextEdit()
        self.output.setReadOnly(True)

        tab1 = QWidget()
        l1 = QVBoxLayout(tab1)
        l1.addWidget(self.output)

        self.table = QTableWidget(3, 2)
        self.table.setHorizontalHeaderLabels(["Metric", "Value"])
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self.table.verticalHeader().setVisible(False)

        tab2 = QWidget()
        l2 = QVBoxLayout(tab2)
        l2.addWidget(self.table)

        self.tabs.addTab(tab1, "Summary")
        self.tabs.addTab(tab2, "Metrics")

        right_layout.addWidget(self.tabs)

        splitter.addWidget(left_panel)
        splitter.addWidget(right_panel)
        splitter.setSizes([400, 700])

        # Loading overlay
        self.loading = LoadingOverlay(self.centralWidget())
        self.loading.resize(self.centralWidget().size())

        self.statusBar().showMessage("Ready")

    def resizeEvent(self, event):
        self.loading.resize(self.centralWidget().size())
        super().resizeEvent(event)

    # def process(self):
    #     text = self.input_text.toPlainText().strip()
    #     if not text:
    #         self.statusBar().showMessage("Enter text first!", 3000)
    #         return

    #     self.loading.show()
    #     QApplication.processEvents()

    #     self.btn.setEnabled(False)
    #     QApplication.setOverrideCursor(QCursor(Qt.WaitCursor))

    #     # simulate delay
    #     QTimer.singleShot(1500, lambda: self.finish(text))
    def process(self):
        text = self.input_text.toPlainText().strip()

        if not text:
            return

        self.loading.show()
        QApplication.processEvents()

        try:
            QTimer.singleShot(50, lambda: self.run_model(text))
        except Exception as e:
            print("ERROR IN TIMER:", e)
    # def finish(self, text):
    #     if "TF-IDF" in self.model_combo.currentText():
    #         summary = text[:150] + "..."
    #         reduction = "40%"
    #     else:
    #         summary = "Short meaningful generated summary."
    #         reduction = "70%"

    #     self.output.setPlainText(summary)

    #     # animation
    #     self.anim = QPropertyAnimation(self.output, b"windowOpacity")
    #     self.anim.setDuration(500)
    #     self.anim.setStartValue(0)
    #     self.anim.setEndValue(1)
    #     self.anim.start()

    #     data = [
    #         ("Original Length", str(len(text))),
    #         ("Summary Length", str(len(summary))),
    #         ("Reduction", reduction)
    #     ]

    #     for i, (k, v) in enumerate(data):
    #         self.table.setItem(i, 0, QTableWidgetItem(k))
    #         self.table.setItem(i, 1, QTableWidgetItem(v))

    #     self.loading.hide()
    #     self.btn.setEnabled(True)
    #     QApplication.restoreOverrideCursor()
    #     self.statusBar().showMessage("Done!", 3000)

    def finish(self, text):
        selected_model = self.model_combo.currentText()

        # ===============================
        # 🟢 TF-IDF
        # ===============================
        if "TF-IDF" in selected_model:
            summary = tfidf_model.summarize(text)
            reduction = "40%"

        # ===============================
        # 🔵 TRANSFORMER
        # ===============================
        else:
            # summary = transformer_model.summarize(text)
            reduction = "70%"

        # ===== UI UPDATE =====
        self.output.setPlainText(summary)

        self.anim = QPropertyAnimation(self.output, b"windowOpacity")
        self.anim.setDuration(500)
        self.anim.setStartValue(0)
        self.anim.setEndValue(1)
        self.anim.start()

        data = [
            ("Original Length", str(len(text))),
            ("Summary Length", str(len(summary))),
            ("Reduction", reduction)
        ]

        for i, (k, v) in enumerate(data):
            self.table.setItem(i, 0, QTableWidgetItem(k))
            self.table.setItem(i, 1, QTableWidgetItem(v))

        self.loading.hide()
        self.btn.setEnabled(True)
        QApplication.restoreOverrideCursor()
# ================= MAIN =================
if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setStyle("Fusion")

    app.setStyleSheet("""
        QWidget {
            background-color: #121212;
            color: #EAEAEA;
        }
        QTextEdit {
            background-color: #1E1E1E;
            border-radius: 10px;
            padding: 10px;
        }
        QPushButton {
            background-color: #0d6efd;
            border-radius: 12px;
            padding: 10px;
            color: white;
            font-weight: bold;
        }
        QPushButton:hover {
            background-color: #3b82f6;
        }
    """)

    # splash
    splash = SplashScreen()
    splash.show()

    # def start_app():
    #     window = SummarizerApp()
    #     window.show()
    #     splash.close()
    #     return window

    # # delay before showing main window
    # QTimer.singleShot(2000, start_app)
    main_window = None  # global reference

    def start_app():
        global main_window
        main_window = SummarizerApp()
        main_window.show()
        splash.close()

    QTimer.singleShot(2000, start_app)
    sys.exit(app.exec())