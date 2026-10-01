import Link from 'next/link'
import { ClipboardList, ShieldCheck, Trash2 } from 'lucide-react'
import { SUPPORT_EMAIL } from '@/lib/site'

export const metadata = {
  title: 'Privacy Policy · Peptora',
  description:
    'What Peptora stores, why, who processes it, and how to delete your account and everything in it.',
}

// Update this whenever the text below changes in substance.
const effectiveDate = 'October 1, 2026'

const highlights = [
  {
    icon: ClipboardList,
    label: 'What we store',
    text: 'Your account details and what you save: protocols, log entries and saved calculations. No advertising and no analytics trackers.',
  },
  {
    icon: ShieldCheck,
    label: 'Not sold, not shared for ads',
    text: 'Your information is used to run Peptora for you. It is never sold and never given to advertisers.',
  },
  {
    icon: Trash2,
    label: 'Delete it yourself',
    text: 'You can delete your account, and everything stored with it, from Profile in the app or on the web.',
  },
]

// Sections 1 to 8, then Account Deletion as section 9, then the rest.
const before = [
  {
    num: '1',
    title: 'Who We Are',
    body: [
      'Peptora is a tracking and reference tool for peptides. It records the schedule you set for yourself and keeps your log. It also includes a reference library that cites its sources and a reconstitution calculator that works on numbers you enter. Peptora does not recommend doses and does not sell peptides or medication.',
      'This Privacy Policy explains what information Peptora collects, how it is used, who processes it, and the choices you have. It applies to peptora.io, to the Peptora apps for iPhone and Android, and to any other Peptora service that links to this policy.',
    ],
  },
  {
    num: '2',
    title: 'Information We Collect',
    body: [
      'Account information: your email address, your name if you give one, a hashed version of your password (we never store the password itself), whether your email is verified, when you accepted the terms, and when you last signed in.',
      'What you save in Peptora: your protocols (the name, the vial amount, the water volume, the amount and schedule you set, and any notes), your log entries (the amount, the time and any note you add), and calculations you choose to save. You decide what goes into these fields.',
      'Purchases made in the iPhone app: Peptora Pro is sold there as an App Store subscription. Apple handles the payment. Peptora receives from Apple a signed record of the purchase: which plan was bought, when it started, when it expires or renews, and a transaction identifier. Peptora never receives your card details or your Apple ID email address.',
      'Purchases made on the web: your submitted payment reference, the amount and date you report, the name on the sending account, any note you add, and the receipt file you upload as proof of payment. Peptora has no card processor on the web and never receives or stores card numbers. Receipt files are kept in private storage, can be read only by the Peptora administrators who review your payment, and are never publicly accessible.',
      'Access information: whether your account has Peptora Pro, how it was obtained (a trial, an App Store subscription or a purchase on the web), and when it ends.',
      'Device and technical information: a hashed device fingerprint that is used to give each device one trial and to prevent abuse, a hashed form of your IP address recorded with sign-in and security events, the type of device or browser you use, and the session cookies or tokens that keep you signed in.',
      'Notifications: if you allow notifications in the mobile app, a push token for your device, so that a reminder can be delivered to it. You can turn notifications off in your device settings at any time.',
      'Communications: messages you send us, and the emails we send you to verify your address, reset your password or tell you about your account.',
    ],
  },
  {
    num: '3',
    title: 'How We Use Information',
    body: [
      'We use this information to create and secure your account, to keep you signed in, to store and show you what you have saved, to work out whether your account has Peptora Pro, to send the emails and notifications described above, to prevent fraud and abuse, and to meet legal obligations.',
      'Peptora does not use your information for advertising, does not build advertising profiles, and does not use advertising or analytics trackers. Peptora has no AI features, and nothing you enter is sent to an AI provider.',
      'Peptora is not a healthcare provider. What you enter into Peptora is your own record. It is not a medical record, and Peptora should not be used for emergencies, diagnosis or treatment decisions.',
    ],
  },
  {
    num: '4',
    title: 'Cookies, Sessions and Device Fingerprints',
    body: [
      'On the web, Peptora uses cookies only to keep you signed in and to protect your session. They are httpOnly authentication cookies and are not used for advertising or tracking. The mobile app stores its sign-in tokens in the secure storage provided by your phone.',
      'Peptora generates a hashed device fingerprint from signals such as the browser or device model, the system version, screen size, timezone and language. It is recorded when a trial is granted, so that each device receives one trial, and it helps reduce abuse. It is not used to follow you across other sites or apps.',
    ],
  },
  {
    num: '5',
    title: 'How We Share Information',
    body: [
      'We do not sell your personal information. We share it only with the service providers that run Peptora for us, and only as far as each one needs: Railway hosts the API, the database and the private file storage; Vercel hosts the website; Resend delivers our emails; and Expo, together with Apple and Google, delivers push notifications to your device.',
      'When you buy Peptora Pro in the iPhone app, the purchase is made with Apple under Apple\'s own terms and privacy policy. Apple tells us about the purchase as described in section 2. Web payments are verified by hand by Peptora administrators, and receipt files are not shared with anyone outside Peptora. If you pay through a payment link we send you, that payment is handled by the provider named on the payment page.',
      'We may also disclose information when the law requires it, to protect Peptora or its users, to investigate abuse, or as part of a merger, acquisition or other transfer of the business.',
    ],
  },
  {
    num: '6',
    title: 'Data Retention',
    body: [
      'We keep your information for as long as you have an account. When you delete your account, everything described in section 9 is deleted at once.',
      'Receipt files for web payments are deleted twelve months after the payment is reviewed, or sooner if you delete your account.',
      'Email verification codes and password reset links expire shortly after they are issued.',
    ],
  },
  {
    num: '7',
    title: 'Security',
    body: [
      'We use technical and organisational safeguards to protect your information, including encrypted connections, hashed passwords, secure session cookies and access controls. No internet service can guarantee absolute security.',
      'You are responsible for keeping your password confidential and for using a secure device when you access Peptora.',
    ],
  },
  {
    num: '8',
    title: 'Your Choices and Rights',
    body: [
      'You can see and change what you have saved inside Peptora, and you can delete your account yourself as described in section 9. An App Store subscription is managed and cancelled in your App Store account settings, not by Peptora.',
      'Depending on where you live, you may have the right to ask for access to your information, for it to be corrected, deleted or exported, or to object to or restrict how it is used. To make a request, email us at the address in section 13. We may need to verify your identity first.',
      'You can control cookies through your browser. Blocking the sign-in cookies will prevent you from logging in on the web.',
    ],
  },
]

const after = [
  {
    num: '10',
    title: 'International Users',
    body: [
      'Peptora may process and store information in countries other than your own. Those countries may have data protection laws that differ from the laws where you live.',
      'Where required, we rely on appropriate legal mechanisms for international transfers, such as contractual protections with our service providers.',
    ],
  },
  {
    num: '11',
    title: 'Children',
    body: [
      'Peptora is for adults. It is not intended for anyone under 18, and we do not knowingly collect personal information from anyone under 18. If you believe someone under 18 has given information to Peptora, contact us so that we can delete it.',
    ],
  },
  {
    num: '12',
    title: 'Changes to This Policy',
    body: [
      'We may update this Privacy Policy from time to time. When a change is material, we will take reasonable steps to tell you, such as updating the effective date, posting a notice, or sending an email to your account address.',
    ],
  },
]

const DELETE_STEPS = [
  {
    where: 'In the iPhone or Android app',
    steps: 'Open Profile, choose Delete account, enter your password, then press and hold the delete button until it completes.',
  },
  {
    where: 'On the web',
    steps: 'Log in at peptora.io, open Profile, choose Delete account and confirm with your password.',
  },
]

function Section({ section }) {
  return (
    <section id={`section-${section.num}`}>
      <h2>
        <span className="privacy-section-num">{section.num}.</span>
        {section.title}
      </h2>
      {section.body.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </section>
  )
}

export default function PrivacyPolicyPage() {
  return (
    <main className="privacy-page">
      <section className="privacy-hero">
        <div>
          <div className="privacy-eyebrow">
            <span className="privacy-eyebrow-dot" />
            PRIVACY POLICY
          </div>
          <h1>
            Your data,
            <br />
            clearly explained.
          </h1>
          <p>
            What Peptora stores, why it stores it, who processes it, and how
            you delete it.
          </p>
          <div className="privacy-meta">Effective date: {effectiveDate}</div>
        </div>

        <div className="privacy-summary" aria-label="Privacy highlights">
          {highlights.map(({ icon: Icon, label, text }) => (
            <div className="privacy-summary-item" key={label}>
              <div className="privacy-summary-header">
                <Icon size={16} aria-hidden="true" className="shrink-0 text-teal" />
                <span className="privacy-summary-label">{label}</span>
              </div>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="privacy-notice">
        <div className="privacy-notice-label">A tracking and reference tool</div>
        <p>
          Peptora records the schedule you set. It does not recommend doses,
          it is not medical advice and it is not a healthcare provider. Do not
          enter emergency, clinical or patient-care information into the app.
        </p>
      </section>

      <article className="privacy-prose">
        {before.map((section) => (
          <Section key={section.num} section={section} />
        ))}

        <section id="account-deletion">
          <h2>
            <span className="privacy-section-num">9.</span>
            Account Deletion
          </h2>
          <p>
            You can permanently delete your Peptora account at any time,
            yourself, without contacting us.
          </p>

          <div className="my-[18px] rounded-[14px] border border-danger/25 bg-danger/6 p-[22px]">
            <p className="!mb-4 !text-[13px] !font-semibold !text-tx">
              How to delete your account
            </p>

            {DELETE_STEPS.map(({ where, steps }, i) => (
              <div key={where} className="mb-3 flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-px flex size-[22px] shrink-0 items-center justify-center rounded-full border border-danger/30 bg-danger/15 font-mono text-[11px] text-danger"
                >
                  {i + 1}
                </span>
                <span className="text-sm leading-[1.65] text-tx2">
                  <strong className="font-semibold text-tx">{where}.</strong> {steps}
                </span>
              </div>
            ))}

            <p className="!mb-0 mt-1 border-t border-danger/15 pt-4 !text-[13.5px] !leading-[1.7]">
              If you cannot sign in, email{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-tx">
                {SUPPORT_EMAIL}
              </a>{' '}
              from the address on the account with the subject line
              &quot;Account deletion request&quot;. We will delete the account within 30 days.
            </p>
          </div>

          <p>
            Deleting your account erases your profile, email address and
            login, every protocol and log entry, your saved calculations, your
            notification token, any web payment records and receipt files, and
            the link between your account and any App Store subscription. A
            deleted account cannot be recovered.
          </p>
          <p>
            Two things remain, and neither identifies you: the hashed device
            fingerprint that records that a device has already had its trial,
            and an entry in our security log that an account was deleted, with
            no account attached. If our hosting provider keeps routine backups,
            deleted data can remain in them until those backups expire.
          </p>
          <p>
            Deleting your account does not cancel an App Store subscription,
            because only you can do that. Cancel it in your App Store account
            settings so that Apple does not charge you again.
          </p>
        </section>

        {after.map((section) => (
          <Section key={section.num} section={section} />
        ))}

        <section id="section-13">
          <h2>
            <span className="privacy-section-num">13.</span>
            Contact
          </h2>
          <p>
            For privacy questions or requests, email{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-teal">
              {SUPPORT_EMAIL}
            </a>{' '}
            or use the{' '}
            <Link href="/support" className="text-teal">
              support page
            </Link>
            .
          </p>
        </section>
      </article>

      <div className="privacy-footer-nav">
        <Link href="/">Back to Peptora</Link>
        <Link href="/support">Contact support</Link>
      </div>
    </main>
  )
}
