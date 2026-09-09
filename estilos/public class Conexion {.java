public class Conexion {
    private final String url;

    public Conexion(String url) {
        this.url = url;
    }

    @PostConstruct
    public void iniciar() {
        System.out.println("Conexión abierta a " + url);
    }

    @PreDestroy
    public void cerrar() {
        System.out.println("Conexión cerrada");
    }
}


@Configuration
public class ConfigA {

    @Bean
    public Conexion conexion() {
        return new Conexion("jdbc://localhost");
    }
}

public class ConexionFactoryBean implements FactoryBean<Conexion>, DisposableBean {

    private Conexion conexion;

    @Override
    public Conexion getObject() {
        if (conexion == null) {
            conexion = new Conexion("jdbc://localhost");
            conexion.iniciar();     // hay que llamarlo a mano
        }
        return conexion;
    }

    @Override
    public Class<?> getObjectType() {
        return Conexion.class;
    }

    @Override
    public void destroy() {
        if (conexion != null) {
            conexion.cerrar();      // hay que cerrarlo a mano
        }
    }
}

@Configuration
public class ConfigB {

    @Bean
    public ConexionFactoryBean conexion() {
        return new ConexionFactoryBean();
    }
}