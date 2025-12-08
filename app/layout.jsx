import './globals.css';
import AuthProvider from './components/AuthProvider';

export const metadata = {
   title: 'StockCalc ID - Kalkulator P/L Saham Indonesia',
   description: 'Aplikasi untuk menghitung Profit/Loss saham Indonesia dengan fitur IPO Tracker yang lengkap',
   keywords: 'saham, P/L, profit loss, kalkulator saham, IPO tracker, Indonesia',
};

export default function RootLayout({ children }) {
   return (
      <html lang="id">
         <head>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
         </head>
         <body>
            <AuthProvider>
               {children}
            </AuthProvider>
         </body>
      </html>
   );
}
