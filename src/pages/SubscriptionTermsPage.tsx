import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, RefreshCw, CreditCard, CalendarDays, AlertCircle, Shield, Users } from 'lucide-react';

const SubscriptionTermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/" className="inline-flex items-center text-carehub-teal hover:text-carehub-teal-dark transition-colors group">
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Quay lại trang chủ
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="relative bg-gradient-to-r from-carehub-teal to-carehub-teal-dark text-white py-16">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-5">
            <FileText className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Đăng ký &amp; Tiết kiệm — Điều Khoản</h1>
          <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
            Terminii și condițiile serviciului de abonament CareHub
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          <div className="space-y-8">
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <RefreshCw className="w-6 h-6 text-carehub-teal" />
                <h2 className="text-2xl font-bold text-gray-900">1. Cum funcționează Đăng ký</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Đăng ký &amp; Tiết kiệm este un serviciu prin care ați primi giao hàng periodică a unui produs la un preț redus. Necesitați un cont CareHub. Alegeți produsele și freqvența (4/8/12 tuần); primiți -30% (formulă infantă -20%) și miễn phí vận chuyển la fiecare comandă de abonament.
              </p>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <CreditCard className="w-6 h-6 text-carehub-teal" />
                <h2 className="text-2xl font-bold text-gray-900">2. Plata și confirmarea per ciclă</h2>
              </div>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Plătiți la giao hàng (COD) sau prin transfer manuală — nu stocăm date carduri și nu auto-încasăm.</li>
                <li>Înaintea fiecarei giao hàng, vă contactăm (WhatsApp/SMS/email) pentru confirmare.</li>
                <li>Fără confirmare, giao hàng este skipă — nică auto-livrare, nică auto-încasare.</li>
                <li>Dacă plata nu este confirmată după 3 zilă (2 reminder-uri + 1 SMS), abonamentul este pauză automat.</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <CalendarDays className="w-6 h-6 text-carehub-teal" />
                <h2 className="text-2xl font-bold text-gray-900">3. Freqvența și skipă/pauză</h2>
              </div>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Prețul abonamentului este același la orice freqvență — freqvența aleșa doar cadentia de giao hàng, nu prețul.</li>
                <li>Poteți skipă (omite) o giao hàng, pauză sau schimba freqvența oricând din secțiuma „Đăng ký” a contului.</li>
                <li>Nu există perioadă minimă de abonament și nu există penaliză la anulare.</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="w-6 h-6 text-carehub-teal" />
                <h2 className="text-2xl font-bold text-gray-900">4. Situații speciale</h2>
              </div>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Stock epuisé:</strong> dacă un produs abonament nu este disponibil, giao hàng este pauză și sunteți notificat — nu vă auto-încasăm și nu înlocuim produsul fără acord.</li>
                <li><strong>Schimbări de preț:</strong> dacă prețul unui produs abonament este schimbat, primiți notificare cu min. 14 zilă înaintea efectuării; poteți anula fără penaliză înaintea de acea dată.</li>
                <li><strong>Code promoționale:</strong> nu se aplică la comenzile de abonament. Beneficiați în schimba de -30% (formulă -20%) + miễn phí vận chuyển.</li>
                <li><strong>Anulare din partea CareHub:</strong> ne rezervăm dreptul de a anula un abonament acționând rezonabil (produs întrerupt, nerespectarea termeniilor, plăți esuate repetat).</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Users className="w-6 h-6 text-carehub-teal" />
                <h2 className="text-2xl font-bold text-gray-900">5. Responsabilitățile dumneavostră</h2>
              </div>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Mentineți date de contact (email/telefon) actuale pentru confirmare.</li>
                <li>Păstreț ĭ data de giao hàng și adresa actuală.</li>
                <li>Anulați sau modificați înaintea următoarea ciclă confirmată pentru a nu primi giao hàng.</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-6 h-6 text-carehub-teal" />
                <h2 className="text-2xl font-bold text-gray-900">6. Contact și schimbări</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                CareHub poate schimba acest Termini în orice moment, cu notificare rezonabilă înainte. Continuarea abonamentului după notificare implică acordul dumneavostră. Pentru întrăbări, contactați serviciul clienț CareHub (WhatsApp / email / telefon).
              </p>
            </section>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Ultima actualizare: septembrie 2026 · Model de confirmare per ciclă (COD-first)
        </p>
      </div>
    </div>
  );
};

export default SubscriptionTermsPage;