import { useLocation } from "wouter";
import { BookOpen, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Upload, ShoppingCart, Clock, Shield } from "lucide-react";

export function Footer() {
  const [, navigate] = useLocation();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-[#005f8a] to-[#0080b8] py-10 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Vous avez une liste de livres ?
          </h2>
          <p className="text-blue-100 mb-6 text-sm sm:text-base">
            Envoyez-la nous et recevez votre devis personnalisé sous 24h
          </p>
          <button
            onClick={() => navigate("/supply-list-upload")}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#005f8a] rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Upload className="w-6 h-6" />
            ENVOYER MA LISTE
          </button>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Logo & Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[#005f8a] rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-lg">Cavally Livres</p>
                <p className="text-xs text-gray-400">Manuels & Oeuvres</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Votre librairie en ligne spécialisée dans les manuels scolaires et oeuvres littéraires en Côte d'Ivoire.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 bg-gray-700 hover:bg-[#005f8a] rounded-lg flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-700 hover:bg-[#005f8a] rounded-lg flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-700 hover:bg-[#005f8a] rounded-lg flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">Navigation</h3>
            <ul className="space-y-2">
              {[
                { label: "Catalogue", path: "/" },
                { label: "Envoyer ma liste", path: "/supply-list-upload" },
                { label: "Mon panier", path: "/cart" },
                { label: "Mon compte", path: "/account" },
                { label: "Mes commandes", path: "/customer-dashboard" },
                { label: "Suivre ma commande", path: "/track-order" },
              ].map(link => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-sm text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-flex items-center gap-1 group"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#005f8a] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Service Client</p>
                  <a href="tel:+2250173924646" className="text-sm text-gray-400 hover:text-white transition-colors">
                    +225 01 73 92 46 46
                  </a>
                  <a href="tel:+2250501956464" className="text-sm text-gray-400 hover:text-white transition-colors block mt-1">
                    +225 05 01 95 64 64
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#005f8a] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Email</p>
                  <a href="mailto:service.client@cavally-livres.com" className="text-sm text-gray-400 hover:text-white transition-colors break-all">
                    service.client@cavally-livres.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#005f8a] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Adresse</p>
                  <p className="text-sm text-gray-400">Abidjan, Côte d'Ivoire</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#005f8a] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Horaires</p>
                  <p className="text-sm text-gray-400">Lun - Sam: 8h - 18h</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Paiements & Livraison */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">Paiements acceptés</h3>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {[
                { icon: "🌊", name: "Wave" },
                { icon: "🟠", name: "Orange Money" },
                { icon: "🟡", name: "MTN MoMo" },
                { icon: "💵", name: "Cash" },
              ].map(pm => (
                <div key={pm.name} className="bg-gray-800 rounded-lg p-2 text-center">
                  <span className="text-lg">{pm.icon}</span>
                  <p className="text-xs text-gray-400 mt-1">{pm.name}</p>
                </div>
              ))}
            </div>
            <div className="bg-gray-800 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-white">Achat sécurisé</span>
              </div>
              <p className="text-xs text-gray-400">Vos données sont protégées et vos paiements sécurisés.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-6 px-4">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 text-center sm:text-left">
            © {year} Cavally Livres — Tous droits réservés
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            <button onClick={() => navigate("/supply-list-upload")} className="hover:text-white transition-colors">
              Envoyer ma liste
            </button>
            <span>|</span>
            <a href="mailto:service.client@cavally-livres.com" className="hover:text-white transition-colors">
              Contact
            </a>
            <span>|</span>
            <button className="hover:text-white transition-colors">CGV</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
