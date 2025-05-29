
interface VirtualServiceRoute {
    match?: Array<{
        headers?: Record<string, { exact: string }>;
    }>;
    route: Array<{
        destination: {
            host: string;
            port: {
                number: number;
            };
        };
    }>;
}

interface VirtualServiceParams {
    sessionId: string;
    appName?: string; // default: 'callcode'
    gateway?: string; // default: 'callcode-gateway' which is the name of istio gateway
    namespace?: string; // default: 'default'
    hosts?: string[]; // custom hosts, will generate defaults if not provided
    routes?: VirtualServiceRoute[]; // custom routes, will generate defaults if not provided
}


export function createVirtualServiceManifest({
    sessionId,
    appName = 'callcode',
    gateway = 'callcode-gateway',
    namespace = 'default',
    hosts,
    routes
}: VirtualServiceParams): any {
    const serviceName = `${appName}-session-${sessionId}`;
    const serviceHost = `${serviceName}.${namespace}.svc.cluster.local`;

    // Generate default hosts if not provided
    const defaultHosts = [
        `${sessionId}.call-code.local`,
        `ws.${sessionId}.call-code.local`
    ];

    // Generate default routes if not provided
    const defaultRoutes: VirtualServiceRoute[] = [
        {
            match: [
                {
                    headers: {
                        ":authority": {
                            exact: `ws.${sessionId}.call-code.local`
                        }
                    }
                }
            ],
            route: [
                {
                    destination: {
                        host: serviceHost,
                        port: {
                            number: 8080
                        }
                    }
                }
            ]
        },
        {
            route: [
                {
                    destination: {
                        host: serviceHost,
                        port: {
                            number: 80
                        }
                    }
                }
            ]
        }
    ];

    return {
        apiVersion: 'networking.istio.io/v1beta1',
        kind: 'VirtualService',
        metadata: {
            name: serviceName,
            labels: {
                app: appName,
                'session-id': sessionId,
            },
        },
        spec: {
            hosts: hosts || defaultHosts,
            gateways: [gateway],
            http: routes || defaultRoutes,
        },
    };
}
