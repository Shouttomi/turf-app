import './globals.css';

export const metadata = {
  title: 'TurfSprint — Book your turf',
  description: 'Your booking page, ready for Instagram & WhatsApp.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
