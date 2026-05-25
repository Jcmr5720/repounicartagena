import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Repositorio REDS Colombia
            </h3>
            <p className="mt-2 text-base text-muted-foreground">
              Plataforma para la consulta y publicación de recursos digitales
              de REDS Colombia.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground">Enlaces</h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/como-funciona"
                  className="text-base text-muted-foreground transition-colors hover:text-primary"
                >
                  Cómo funciona
                </Link>
              </li>
              <li>
                <Link
                  href="/explorar"
                  className="text-base text-muted-foreground transition-colors hover:text-primary"
                >
                  Explorar recursos
                </Link>
              </li>
              <li>
                <Link
                  href="/cuenta"
                  className="text-base text-muted-foreground transition-colors hover:text-primary"
                >
                  Mi cuenta
                </Link>
              </li>
              <li>
                <Link
                  href="mailto:repositorio@redscolombia.edu.co"
                  className="text-base text-muted-foreground transition-colors hover:text-primary"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground">REDS Colombia</h4>
            <ul className="mt-3 space-y-2 text-base text-muted-foreground">
              <li>Sede principal</li>
              <li>Colombia</li>
              <li>Innovación y gestión de recursos digitales</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center">
          <p className="text-base text-muted-foreground">
            © 2026 Repositorio REDS Colombia. Proyecto académico demostrativo.
          </p>
        </div>
      </div>
    </footer>
  );
}
