import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle, CreditCard, CalendarDays, Pause, RefreshCw, AlertCircle } from 'lucide-react';

const SubscriptionFAQsPage: React.FC = () => {
  const faqs = [
    {
      icon: RefreshCw,
      q: 'Cum funcționează Đăng ký & Tiết kiệm?',
      a: 'Când ați ales un produs și ați bilați „Đăng ký & Tiết kiệm”, beneficiați de -30% (formulă infantă -20%) și miễn phí vận chuyển. Înaintea fiecarei giao hàng, vă contactăm (WhatsApp/SMS/email) pentru a confirma următoarea giao hàng. Confirmarea este făcută per ciclă — nu există nică automată, nică angajă ascunsă.',
    },
    {
      icon: CreditCard,
      q: 'Cum platesc?',
      a: 'Plătiți la livrare (COD) sau prin transfer manuală. Prima comandă este plătită cum ați obișnuit. La fiecare ciclă confirmată, primiți una factură cu același -30% și plătiți la giao hàng. Nu stocăm date carduri de credit și nu există auto-încasări.',
    },
    {
      icon: CalendarDays,
      q: 'Ce freqvență poteu alețe?',
      a: 'Poteți alețe giao hàng la 4, 8 sau 12 tuần. Prețul este aceleași (-30% sau -20% pentru formulă) la orice freqvență — freqvența este doar o alețe de timp, nu o alețe de preț. Freqvența 4 tuần este cea mai populară și este presețată implicită.',
    },
    {
      icon: Pause,
      q: 'Pot să pauză sau să omit o giao hàng?',
      a: 'Da. În secțiuma „Đăng ký” din contul dumneavostră poteți pauză, skipă (omite următoarea giao hàng) sau schimba freqvența oricând, fără penaliză. Poteți anula complet oricând — nu există perioadă minimă.',
    },
    {
      icon: AlertCircle,
      q: 'Ce se întâmplă dacă nu confirmă giao hàng?',
      a: 'Dacă nu confirmă în 3 zilă (2 reminder-uri WhatsApp + 1 SMS), ciclă este skipă și primiți notificațiumă. Nu vă auto-încasăm nică auto-livramă fără confirmare. În caz de stock epuisé, giao hàng este pauză și sunteți notificat.',
    },
    {
      icon: RefreshCw,
      q: 'Pot să anulă oricând?',
      a: 'Da, fără penaliză și fără perioadă minimă. Anulați din „Đăng ký” și contul dumneavostră. Dacă prețul unui produs din abonament este schimbat, primiți notificare cu min. 14 zilă înainte, și poteți anula fără penaliză înaintea de efectuarea schimbării.',
    },
    {
      icon: CreditCard,
      q: 'Pot să utiliză cod promoțional pentru abonamente?',
      a: 'Nu. Code promoționale nu se aplică la comenzile de abonament — în loc de aceasta, beneficiați de -30% (formulă -20%) + miễn phí vận chuyển la fiecare comandă de abonament, care este o ofertă și mai bună.',
    },
    {
      icon: HelpCircle,
      q: 'Cum îmi gestioneză abonamentele?',
      a: 'Logați-vă în cont, mergeți la „Đăng ký” și poteți: schimba freqvența, schimba adresa, skipă, pauză sau anula. Fiecare abonament afișăază următoarea dată de giao hàng și statusul actual.',
    },
  ];

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
            <HelpCircle className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Đăng ký — FAQ</h1>
          <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
            Tote întrăbările despre Đăng ký &amp; Tiết kiệm
          </p>
        </div>
      </div>

      {/* FAQ list */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-6">
          {faqs.map(({ icon: Icon, q, a }) => (
            <div key={q} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-carehub-teal/10 rounded-full flex items-center justify-center">
                  <Icon className="w-5 h-5 text-carehub-teal" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{q}</h3>
                  <p className="text-gray-700 leading-relaxed mt-2">{a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-green-50 rounded-xl p-6">
          <p className="font-medium text-gray-900 mb-2">Întrăbări suplementăre?</p>
          <p className="text-sm text-gray-700">
            Contactați-ne: WhatsApp / email / telefon. Vă răspundem în 1–2 zilă lucrătoare.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionFAQsPage;