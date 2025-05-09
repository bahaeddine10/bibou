import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

declare module 'next-auth' {
  interface User {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    matricule: string;
    accessToken?: string;
    role: string;
    department: string;
    departmentId: string;     // ✅ New
    isValidator: boolean;     // ✅ New
    isSuperAdmin: boolean;     // ✅ New

    modules: { id: number; name: string }[];
    
  }

  interface Session {
    user: {
      id: string;
      nom: string;
      prenom: string;
      email: string;
      matricule: string;
      role: string;
      department: string;
      departmentId: string;   // ✅ New
      isValidator: boolean;   // ✅ New
      isSuperAdmin: boolean;   // ✅ New
      accessToken?: string;
      modules: { id: number; name: string }[];
    };
  }
}

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'Email' },
        password: { label: 'Password', type: 'password', placeholder: 'Password' },
      },
      async authorize(credentials) {
       
        // Check if email and password are provided 
        const { email, password } = credentials as { email: string; password: string };
        
        try {
          const res = await fetch("http://localhost:8000/graphql", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: `
                mutation {
                  login(email: "${email}", password: "${password}") {
                    access_token
                    token_type
                    expires_in
                    user {
                          id
                          nom
                          prenom
                        
                          email
                          matricule
                          department
                          departmentId
                          isValidator
                          isSuperAdmin
                          modules {
                            id
                            name
                              }
                          }

                  }
                }
              `,
            }),
          });
      
          const data = await res.json();
          
      
          if (data.errors || !data.data?.login?.user) {
            console.error("❌ Login error (GraphQL response has errors):", data.errors);
            return null;
          }
      
          const user = data.data.login.user;
          const token = data.data.login.access_token;
      
          if (!user || !user.email || !token) {
            console.error("❌ Missing user or token in GraphQL login");
            return null;
          }
      
          console.log("✅ Authenticated user:", user);
      
          return {
            id: String(user.id),
            nom: user.nom || "",
            prenom: user.prenom || "",
            email: user.email || "",
            matricule: user.matricule || "",
            role: user.role || "employe",
            department: user.department || "",
            departmentId: user.departmentId ?? "",
            isValidator: Boolean(user.isValidator), // ✅ safe boolean
            isSuperAdmin: Boolean(user.isSuperAdmin), // ✅ safe boolean
            accessToken: token ,
            modules: user.modules || [],

          };
        } catch (err) {
          console.log("🔐 GraphQL login err:", err);

          console.error("❌ Exception in authorize():", err);
          return null;
        }
      }
      
      ,
    }),
  ],
  pages: {
    signIn: '/', // Redirect to login page
  },
  session: {
    strategy: 'jwt', // Use JWT for session management
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("🧠 JWT callback - user:", user);
        return {
          ...token,
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          matricule: user.matricule,
          role: user.role,
          department: user.department,
          departmentId: user.departmentId ?? "",
          isValidator: Boolean(user.isValidator),
          isSuperAdmin: Boolean(user.isSuperAdmin),
          accessToken: user.accessToken,
          modules: user.modules || [],

        };
      }
      console.log("🧠 JWT callback - token (no new user):", token);
      return token;
    }
    
    
    ,
    async session({ session, token }) {
      console.log("💾 SESSION callback - token:", token);
      session.user = {
        id: token.id as string,
        nom: token.nom as string,
        prenom: token.prenom as string,
        email: token.email as string,
        matricule: token.matricule as string,
        role: token.role as string,
        department: token.department as string,
        departmentId: token.departmentId as string,
        isValidator: token.isValidator as boolean,
        isSuperAdmin: token.isSuperAdmin as boolean,
        accessToken: token.accessToken as string,
        modules: (token.modules as { id: number; name: string }[]) || [],

      };
      console.log("💾 SESSION callback - session.user:", session.user);
      return session;
    }
    
    
    ,
  },
  
  
  secret: '2BoYHNlKnYxl4TThm+mG9anPKuuap4wD7HU/vMmeaeI=', // Secret for signing tokens
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; // Export GET and POST methods