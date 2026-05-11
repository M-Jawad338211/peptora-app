import Link from 'next/link'
import Nav from '@/components/Nav'

export const metadata = {
  title: 'Privacy Policy — Peptora',
  description: 'How Peptora collects, uses, and protects information for its peptide research intelligence platform.',
}

const effectiveDate = 'May 11, 2026'

const highlights = [
  {
    icon: '🔬',
    label: 'Research-first data',
    text: 'Peptora stores account, subscription, calculator, and AI feature data so the platform can operate and improve.',
  },
  {
    icon: '🚫',
    label: 'No medical care',
    text: 'Peptora is for research and educational use only. We do not provide diagnosis, treatment, or clinical monitoring.',
  },
  {
    icon: '🛡️',
    label: 'Trusted processors',
    text: 'We use service providers such as hosting, database, email, payment, and AI infrastructure providers to run Peptora.',
  },
]

const sections = [
  {
    num: '1',
    title: 'Who We Are',
    body: [
      'Peptora is a research intelligence platform for peptide researchers. The app includes tools such as a dose calculator, peptide encyclopedia, vendor and regulatory research boards, AI research assistant, stack checker, protocol finder, cycle tracker, subscriptions, and account dashboard.',
      'This Privacy Policy explains how Peptora collects, uses, shares, and protects information when you use peptora.app, Peptora web features, and related services that link to this policy.',
    ],
  },
  {
    num: '2',
    title: 'Information We Collect',
    body: [
      'Account information: email address, password credentials, optional full name, verification status, plan type, account settings, and authentication session information.',
      'Usage and research-tool information: calculator inputs and results, calculator usage counts, calculator history for eligible accounts, feature access events, dashboard data, and information you enter into tools such as the cycle tracker, stack checker, protocol finder, or AI research assistant.',
      'AI interaction information: prompts, conversation history sent for context, generated responses, and related metadata needed to provide AI-powered features.',
      'Payment and subscription information: plan selection, subscription status, renewal dates, cancellation status, Stripe customer identifiers, and billing portal activity. Peptora does not store full payment card numbers.',
      'Device and technical information: browser type, device characteristics, operating system, language, timezone, approximate screen details, IP-derived request metadata, cookies, session tokens, logs, and a hashed device fingerprint used for trial limits, abuse prevention, and security.',
      'Communications: messages you send to us, verification emails, password reset requests, support inquiries, and transactional email delivery information.',
    ],
  },
  {
    num: '3',
    title: 'How We Use Information',
    body: [
      'We use information to create and secure accounts, verify email addresses, authenticate sessions, provide free and Pro features, maintain usage limits, process subscriptions, show calculator history, and deliver the product experience you request.',
      'We also use information to operate AI features, troubleshoot errors, prevent fraud or abuse, enforce plan access, improve product reliability, communicate important account or billing updates, and comply with legal obligations.',
      'Peptora is not a healthcare provider. Information entered into Peptora should not be treated as medical records, and Peptora should not be used for emergencies, diagnosis, treatment decisions, or patient care.',
    ],
  },
  {
    num: '4',
    title: 'Cookies, Sessions, and Device Fingerprints',
    body: [
      'Peptora uses cookies and similar technologies to keep you signed in, protect sessions, remember authentication state, and support account security. The app uses httpOnly authentication cookies for access and refresh tokens.',
      'Peptora also generates a hashed device fingerprint from browser and device signals such as user agent, screen size, timezone, language, and hardware concurrency. This fingerprint is stored in session storage and helps enforce free trial limits and reduce abuse.',
    ],
  },
  {
    num: '5',
    title: 'How We Share Information',
    body: [
      'We do not sell your personal information. We share information with service providers that help us run Peptora, including cloud hosting, database, authentication, email delivery, analytics or logging, payment processing, and AI infrastructure providers.',
      'Payment processing is handled through Stripe. AI-powered requests may be processed by AI model providers, including Anthropic, to generate research responses. These providers process information according to their own contracts and policies.',
      'We may also disclose information when required by law, to protect Peptora or users, to investigate abuse, to enforce our terms, or as part of a merger, acquisition, financing, or business transfer.',
    ],
  },
  {
    num: '6',
    title: 'Data Retention',
    body: [
      'We keep information for as long as needed to provide Peptora, maintain your account, comply with legal or tax obligations, resolve disputes, enforce agreements, and protect platform security.',
      'Calculator history, subscription records, audit logs, authentication records, and AI feature data may be retained for different periods depending on product, security, billing, and legal needs. We may delete or de-identify information when it is no longer needed.',
    ],
  },
  {
    num: '7',
    title: 'Security',
    body: [
      'We use technical and organizational safeguards designed to protect information, including encrypted transport, secure authentication cookies, access controls, and provider security controls. No internet service can guarantee absolute security.',
      'You are responsible for keeping your password confidential and for using a secure device and browser when accessing Peptora.',
    ],
  },
  {
    num: '8',
    title: 'Your Choices and Rights',
    body: [
      'You may access, update, or delete certain account information by using your account dashboard or contacting us. You may cancel subscriptions through the billing portal when available.',
      'Depending on where you live, you may have rights to request access, correction, deletion, portability, restriction, objection, or withdrawal of consent. We may need to verify your identity before fulfilling a request.',
      'You can control cookies through your browser. Blocking cookies may prevent login, subscriptions, or other core features from working correctly.',
    ],
  },
  {
    num: '9',
    title: 'International Users',
    body: [
      'Peptora may process and store information in countries other than your own. Those countries may have data protection laws that differ from the laws where you live.',
      'Where required, we rely on appropriate legal mechanisms for international transfers, such as contractual protections with service providers.',
    ],
  },
  {
    num: '10',
    title: 'Children',
    body: [
      'Peptora is not intended for children under 18. We do not knowingly collect personal information from children. If you believe a child has provided information to Peptora, contact us so we can take appropriate action.',
    ],
  },
  {
    num: '11',
    title: 'Changes to This Policy',
    body: [
      'We may update this Privacy Policy from time to time. If changes are material, we will take reasonable steps to notify users, such as updating the effective date, posting a notice, or sending an account email.',
    ],
  },
  {
    num: '12',
    title: 'Contact',
    body: [
      'For privacy questions or requests, contact Peptora support through the contact method provided in the app or by emailing the address listed on Peptora communications.',
    ],
  },
]

export default function PrivacyPolicyPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      <Nav />

      <main className="privacy-page">

        {/* Hero */}
        <section className="privacy-hero">
          <div>
            <div className="privacy-eyebrow">
              <span className="privacy-eyebrow-dot" />
              PRIVACY POLICY
            </div>
            <h1>Your data,<br />clearly explained.</h1>
            <p>
              How Peptora handles information across accounts, subscriptions,
              calculator tools, AI research features, and product security.
            </p>
            <div className="privacy-meta">Effective date: {effectiveDate}</div>
          </div>

          <div className="privacy-summary" aria-label="Privacy highlights">
            {highlights.map((item) => (
              <div className="privacy-summary-item" key={item.label}>
                <div className="privacy-summary-header">
                  <span className="privacy-summary-icon">{item.icon}</span>
                  <span className="privacy-summary-label">{item.label}</span>
                </div>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Medical disclaimer notice */}
        <section className="privacy-notice">
          <div className="privacy-notice-label">⚕️ &nbsp;Research and educational use only</div>
          <p>
            Peptora is not medical advice and is not a healthcare provider.
            Do not enter emergency, clinical, or patient-care information into the app.
          </p>
        </section>

        {/* Main prose */}
        <article className="privacy-prose">
          {sections.map((section) => (
            <section key={section.num} id={`section-${section.num}`}>
              <h2>
                <span className="privacy-section-num">{section.num}.</span>
                {section.title}
              </h2>
              {section.body.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </section>
          ))}
        </article>

        {/* Footer nav */}
        <div className="privacy-footer-nav">
          <Link href="/">← Back to Peptora</Link>
          <Link href="/pricing">View pricing</Link>
        </div>

      </main>
    </div>
  )
}
