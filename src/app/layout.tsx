import './globals.css';
import Header from '../components/Header';
import Providers from '../components/Providers';

export const metadata = {
  title: 'PP E-commerce',
  description: 'Production-ready e-commerce scaffold'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-gray-50">
          <Providers>
            <Header />
            <div className="max-w-6xl mx-auto p-4">{children}</div>
          </Providers>
        </main>
      </body>
    </html>
  );
}
