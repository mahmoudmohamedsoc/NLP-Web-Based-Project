import sys
from PySide6.QtWidgets import QApplication
from app import SummarizerApp

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
            color: white;
            border-radius: 10px;
            padding: 10px;
            font-weight: bold;
        }
        QPushButton:hover {
            background-color: #3b82f6;
        }
    """)

    window = SummarizerApp()
    window.show()

    sys.exit(app.exec())