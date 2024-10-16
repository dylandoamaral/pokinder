import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from src.utils.env import retrieve_gmail_email, retrieve_gmail_password

from .email_dependency import EmailDependency


class GmailEmailDependency(EmailDependency):
    def send_email(self, subject: str, to: str, body: str) -> None:
        email = retrieve_gmail_email()
        password = retrieve_gmail_password()

        smtpserver = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        smtpserver.ehlo()
        smtpserver.login(email, password)

        message = MIMEMultipart()
        message["From"] = f"Pokinder <{email}>"
        message["To"] = to
        message["Subject"] = subject
        message.attach(MIMEText(body, "html", "utf-8"))

        smtpserver.sendmail(email, to, message.as_string())

        smtpserver.close()


def use_gmail_email_dependency() -> EmailDependency:
    return GmailEmailDependency()
