import { motion } from 'framer-motion';
import Header from '../../components/landingPage/Header';
import Footer from '../../components/landingPage/Footer';

const Cookies = () => {
  return (
    <div className="min-h-screen bg-[#0A1128]">
      <Header />
      <div className="pt-32 pb-20">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10"
          >
            <h1 className="text-4xl font-bold text-white mb-8">Cookie Policy</h1>
            
            <div className="space-y-8 text-gray-300">
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">1. What Are Cookies</h2>
                <p className="leading-relaxed">
                  Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">2. Types of Cookies We Use</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-medium text-white mb-2">Essential Cookies</h3>
                    <p className="leading-relaxed">
                      These cookies are necessary for the website to function properly. They enable core functionality such as security, account authentication, and remembering your preferences.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-white mb-2">Performance Cookies</h3>
                    <p className="leading-relaxed">
                      These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-white mb-2">Functionality Cookies</h3>
                    <p className="leading-relaxed">
                      These cookies enable the website to provide enhanced functionality and personalization based on your preferences and choices.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Cookies</h2>
                <p className="leading-relaxed mb-4">
                  We use cookies to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Remember your login details</li>
                  <li>Understand how you use our platform</li>
                  <li>Improve our services</li>
                  <li>Provide personalized content</li>
                  <li>Ensure platform security</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">4. Managing Cookies</h2>
                <p className="leading-relaxed mb-4">
                  You can control and manage cookies in various ways:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Browser settings to accept or reject cookies</li>
                  <li>Delete cookies after each session</li>
                  <li>Set preferences for specific websites</li>
                  <li>Use private browsing mode</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">5. Third-Party Cookies</h2>
                <p className="leading-relaxed">
                  Some of our pages may contain content from third-party services (like social media platforms) which may set their own cookies. We do not control these cookies and recommend checking the privacy policies of these third parties.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">6. Updates to Cookie Policy</h2>
                <p className="leading-relaxed">
                  We may update this Cookie Policy from time to time to reflect changes in our practices or for operational, legal, or regulatory reasons.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">7. Contact Us</h2>
                <p className="leading-relaxed">
                  If you have questions about our Cookie Policy, please contact us at privacy@meerkats.com
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cookies; 