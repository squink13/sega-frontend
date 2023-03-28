import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';

// Top navbar
export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="navbar">
      <ul>
        <li>
          <Link href="/">
            <button className="btn-logo">SEGS</button>
          </Link>
        </li>

        {/* user is signed-in and has username */}
        {status === 'authenticated' && (
          <>
            <Link href={`/${session.user.name}`}>
              <li className="push-left">{session.user.name}</li>
            </Link>
            <li>
              <Link href={`/${session.user.name}`}>
                <img src={session.user.image} alt={session.user.name} />
              </Link>
            </li>
            <li>
              <Link href="/api/auth/signout">
                <button
                  className="btn-blue"
                  onClick={(e) => {
                    e.preventDefault();
                    signOut('osu');
                  }}
                >
                  Sign out
                </button>
              </Link>
            </li>
          </>
        )}

        {/* user is not signed OR has not created username */}
        {status !== 'authenticated' && (
          <li>
            <Link href="/api/auth/signin">
              <button
                className="btn-blue"
                onClick={(e) => {
                  e.preventDefault();
                  signIn('osu');
                }}
              >
                Log in
              </button>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
