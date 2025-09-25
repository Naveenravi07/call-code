import { createJobManifest } from '../templates/job-template';
import constants from './../constants/index';

export function getViteJobManifest(userid: string, sessionid: string) {
  return createJobManifest({
    userId: userid,
    sessionId: sessionid,
    annotations: {
      'sidecar.istio.io/inject': 'true',
    },
    backoffLimit: 4,
    volumes: [
      {
        name: 'code-volume',
        emptyDir: {},
      },
    ],
    initContainers: [
      {
        name: 'copy-code',
        image: constants.VITE_IMG_URL,
        command: [
          'sh',
          '-c',
          'cp -r /home/coder/workspace/* /shared && cp -r /home/coder/workspace/.[^.]* /shared',
        ],
        volumeMounts: [
          {
            name: 'code-volume',
            mountPath: '/shared',
          },
        ],
        securityContext: {
          runAsUser: 0,
        },
      },
    ],
    containers: [
      {
        name: 'user-service',
        image: constants.VITE_IMG_URL,
        ports: [
          {
            containerPort: 5173,
          },
        ],
        volumeMounts: [
          {
            name: 'code-volume',
            mountPath: '/home/coder/workspace',
          },
        ],
      },
      {
        name: 'websocket',
        image: constants.WS_IMG_URL,
        ports: [
          {
            containerPort: 8080,
          },
        ],
        volumeMounts: [
          {
            name: 'code-volume',
            mountPath: '/home/coder/workspace',
          },
        ],
        env: [
          {
            name: 'CODE_DIR',
            value: '/home/coder/workspace',
          },
          {
            name: 'CALLCODE_SESSION_NAME',
            value: sessionid,
          },
        ],
      },
    ],
  });
}

export function getSvelteJobManifest(userid: string, sessionid: string) {
  return createJobManifest({
    userId: userid,
    sessionId: sessionid,
    annotations: {
      'sidecar.istio.io/inject': 'true',
    },
    backoffLimit: 4,
    volumes: [
      {
        name: 'code-volume',
        emptyDir: {},
      },
    ],
    initContainers: [
      {
        name: 'copy-code',
        image: constants.SVELTE_IMG_URL,
        command: [
          'sh',
          '-c',
          'cp -r /home/coder/workspace/* /shared && cp -r /home/coder/workspace/.[^.]* /shared',
        ],
        volumeMounts: [
          {
            name: 'code-volume',
            mountPath: '/shared',
          },
        ],
        securityContext: {
          runAsUser: 0,
        },
      },
    ],
    containers: [
      {
        name: 'user-service',
        image: constants.SVELTE_IMG_URL,
        ports: [
          {
            containerPort: 5173,
          },
        ],
        volumeMounts: [
          {
            name: 'code-volume',
            mountPath: '/home/coder/workspace',
          },
        ],
      },
      {
        name: 'websocket',
        image: constants.WS_IMG_URL,
        ports: [
          {
            containerPort: 8080,
          },
        ],
        volumeMounts: [
          {
            name: 'code-volume',
            mountPath: '/home/coder/workspace',
          },
        ],
        env: [
          {
            name: 'CODE_DIR',
            value: '/home/coder/workspace',
          },
          {
            name: 'CALLCODE_SESSION_NAME',
            value: sessionid,
          },
        ],
      },
    ],
  });
}

export function getNextJobManifest(userid: string, sessionid: string) {
  return createJobManifest({
    userId: userid,
    sessionId: sessionid,
    annotations: {
      'sidecar.istio.io/inject': 'true',
    },
    backoffLimit: 4,
    volumes: [
      {
        name: 'code-volume',
        emptyDir: {},
      },
    ],
    initContainers: [
      {
        name: 'copy-code',
        image: constants.NEXT_IMG_URL,
        command: [
          'sh',
          '-c',
          'cp -r /home/coder/workspace/* /shared && cp -r /home/coder/workspace/.[^.]* /shared',
        ],
        volumeMounts: [
          {
            name: 'code-volume',
            mountPath: '/shared',
          },
        ],
      },
    ],
    containers: [
      {
        name: 'user-service',
        image: constants.NEXT_IMG_URL,
        ports: [
          {
            containerPort: 3000,
          },
        ],
        volumeMounts: [
          {
            name: 'code-volume',
            mountPath: '/home/coder/workspace',
          },
        ],
      },
      {
        name: 'websocket',
        image: constants.WS_IMG_URL,
        ports: [
          {
            containerPort: 8080,
          },
        ],
        volumeMounts: [
          {
            name: 'code-volume',
            mountPath: '/home/coder/workspace',
          },
        ],
        env: [
          {
            name: 'CODE_DIR',
            value: '/home/coder/workspace',
          },
          {
            name: 'CALLCODE_SESSION_NAME',
            value: sessionid,
          },
        ],
      },
    ],
  });
}
