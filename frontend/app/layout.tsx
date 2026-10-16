import './globals.css';
import './incidents.css';
export const metadata = { title: 'Smart Classroom Dashboard', description: 'IoT + n8n dashboard' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="vi"><body>{children}</body></html>;
}
