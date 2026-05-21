import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Repositorio UniCartagena
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Plataforma académica para la consulta y publicación de trabajos
              estudiantiles de la Universidad de Cartagena.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-foreground">Enlaces</h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Políticas del repositorio
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Ayuda
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Contacto
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Accesibilidad
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground">Universidad de Cartagena</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Centro, Calle de la Universidad</li>
              <li>Cartagena de Indias, Colombia</li>
              <li>Fundada en 1827</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 Repositorio UniCartagena. Proyecto académico demostrativo.
          </p>
        </div>
      </div>
    </footer>
  );
}
