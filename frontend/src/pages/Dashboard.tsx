import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { usuario } = useAuth();

    return (
        <div className="space-y-6">
            <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-8 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm">
                <h1 className="text-3xl font-bold text-claro-texto dark:text-oscuro-texto mb-2">
                    Hola, {usuario?.nombre || 'Usuario'} 👋
                </h1>
                <p className="text-claro-texto2 dark:text-oscuro-texto2 text-lg">
                    Has iniciado sesión como <span className="font-semibold text-claro-primario dark:text-oscuro-primario">{usuario?.rol}</span>.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {(usuario?.rol === 'Administrador' || usuario?.rol === 'Admin') && (
                    <>
                        <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-6 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm">
                            <h3 className="text-xl font-bold text-claro-texto dark:text-oscuro-texto mb-2">Gestión de Usuarios</h3>
                            <p className="text-claro-texto2 dark:text-oscuro-texto2 mb-4">Administra cuentas, clientes y empleados del complejo.</p>
                            <Link to="/panel-admin" className="text-claro-primario dark:text-oscuro-primario font-medium hover:underline">
                                Ir al Panel de Usuarios &rarr;
                            </Link>
                        </div>
                        <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-6 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm">
                            <h3 className="text-xl font-bold text-claro-texto dark:text-oscuro-texto mb-2">Gestión de Canchas</h3>
                            <p className="text-claro-texto2 dark:text-oscuro-texto2 mb-4">Crea, edita y supervisa tarifas y disponibilidad de canchas.</p>
                            <Link to="/canchas" className="text-claro-primario dark:text-oscuro-primario font-medium hover:underline">
                                Administrar Canchas &rarr;
                            </Link>
                        </div>
                        <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-6 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm">
                            <h3 className="text-xl font-bold text-claro-texto dark:text-oscuro-texto mb-2">Verificar Pagos</h3>
                            <p className="text-claro-texto2 dark:text-oscuro-texto2 mb-4">Aprueba o rechaza pagos virtuales pendientes de los clientes.</p>
                            <Link to="/verificar-pagos" className="text-claro-primario dark:text-oscuro-primario font-medium hover:underline">
                                Ir a Verificación de Pagos &rarr;
                            </Link>
                        </div>
                        <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-6 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm">
                            <h3 className="text-xl font-bold text-claro-texto dark:text-oscuro-texto mb-2">💰 Gestionar Reembolsos</h3>
                            <p className="text-claro-texto2 dark:text-oscuro-texto2 mb-4">Aprueba o rechaza solicitudes de reembolso por cancelaciones.</p>
                            <Link to="/gestion-reembolsos" className="text-claro-primario dark:text-oscuro-primario font-medium hover:underline">
                                Ir a Reembolsos &rarr;
                            </Link>
                        </div>
                    </>
                )}

                {usuario?.rol === 'Empleado' && (
                    <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-6 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm">
                        <h3 className="text-xl font-bold text-claro-texto dark:text-oscuro-texto mb-2">Verificar Pagos</h3>
                        <p className="text-claro-texto2 dark:text-oscuro-texto2 mb-4">Aprueba o rechaza pagos virtuales pendientes de los clientes.</p>
                        <Link to="/verificar-pagos" className="text-claro-primario dark:text-oscuro-primario font-medium hover:underline">
                            Ir a Verificación de Pagos &rarr;
                        </Link>
                    </div>
                )}

                {(usuario?.rol === 'Cliente' || usuario?.rol === 'Usuario') && (
                    <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-6 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-sm">
                        <h3 className="text-xl font-bold text-claro-texto dark:text-oscuro-texto mb-2">Reservar Cancha</h3>
                        <p className="text-claro-texto2 dark:text-oscuro-texto2 mb-4">Explora disponibilidad y agenda tu próximo partido.</p>
                        <Link to="/canchas" className="text-claro-primario dark:text-oscuro-primario font-medium hover:underline">
                            Explorar canchas &rarr;
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
