import { motion } from 'framer-motion';
import Header from '../../components/landingPage/Header';
import Footer from '../../components/landingPage/Footer';

const Terms = () => {
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
            <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
            
            <div className="space-y-8 text-gray-300">
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                <p className="leading-relaxed">
                  By accessing and using MeerKats, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">2. User Responsibilities</h2>
                <p className="leading-relaxed mb-4">
                  As a user of MeerKats, you agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the confidentiality of your account</li>
                  <li>Use the platform in a professional and respectful manner</li>
                  <li>Not engage in any harmful or malicious activities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">3. Mentorship Services</h2>
                <p className="leading-relaxed">
                  MeerKats provides a platform for connecting mentors and mentees. We do not guarantee specific outcomes from mentorship relationships and are not responsible for the quality of individual mentorship sessions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">4. Intellectual Property</h2>
                <p className="leading-relaxed">
                  All content and materials available on MeerKats are protected by intellectual property rights. Users may not copy, modify, or distribute platform content without explicit permission.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">5. Privacy</h2>
                <p className="leading-relaxed">
                  Your use of MeerKats is also governed by our Privacy Policy. Please review our Privacy Policy to understand how we collect, use, and protect your information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">6. Termination</h2>
                <p className="leading-relaxed">
                  We reserve the right to terminate or suspend access to our platform for violations of these terms or for any other reason at our sole discretion.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">7. Changes to Terms</h2>
                <p className="leading-relaxed">
                  We may update these terms from time to time. Continued use of MeerKats after changes constitutes acceptance of the updated terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">8. Contact Us</h2>
                <p className="leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at support@meerkats.com
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

export default Terms; 