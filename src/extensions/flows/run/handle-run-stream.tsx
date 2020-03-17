import { ReplaySubject } from 'rxjs';
import { Reporter } from '../../reporter';

export async function handleRunStream(stream: ReplaySubject<any>, reporter: Reporter) {
  const summery: { [k: string]: string } = {};
  const streamPromise = await new Promise(resolve =>
    stream.subscribe({
      next(networkData: any) {
        if (networkData instanceof ReplaySubject) {
          // flow stream
          handleFlowStream(networkData, reporter, summery);
        } else if (networkData.type === 'network:start') {
          //
        } else if (networkData.type === 'network:result') {
          summery['network:result'] = networkData;
        } else {
          //
        }
      },
      complete() {
        resolve(summery);
      },
      error() {
        resolve(summery);
      }
    })
  );

  return streamPromise;
}
function handleFlowStream(networkData: ReplaySubject<any>, reporter: Reporter, summery: any) {
  networkData.subscribe({
    next(flowData: any) {
      if (flowData.type === 'flow:start') {
        // print flow start message
      } else if (flowData.type === 'flow:result') {
        // handle flow end
      } else if (flowData instanceof ReplaySubject) {
        handleTaskStream(flowData, reporter);
      }
    },
    error() {},
    complete() {}
  });
}

function handleTaskStream(taskStream: ReplaySubject<any>, reporter: Reporter) {}
