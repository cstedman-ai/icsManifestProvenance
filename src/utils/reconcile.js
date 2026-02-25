export function reconcilePO(po, shipments, receivings) {
  const poShipments = shipments.filter((s) => s.poId === po.id);
  const poReceivings = receivings.filter((r) => r.poId === po.id);

  return po.items.map((item) => {
    const totalShipped = poShipments.reduce((sum, s) => {
      const match = s.items.find((si) => si.poItemId === item.id);
      return sum + (match ? match.quantityShipped : 0);
    }, 0);

    const serialsShipped = poShipments.flatMap((s) => {
      const match = s.items.find((si) => si.poItemId === item.id);
      return match ? match.serialsShipped : [];
    });

    const totalReceived = poReceivings.reduce((sum, r) => {
      const match = r.items.find((ri) => ri.poItemId === item.id);
      return sum + (match ? match.quantityReceived : 0);
    }, 0);

    const serialsReceived = poReceivings.flatMap((r) => {
      const match = r.items.find((ri) => ri.poItemId === item.id);
      return match ? match.serialsReceived : [];
    });

    const missingSerials = serialsShipped.filter(
      (s) => !serialsReceived.includes(s)
    );
    const extraSerials = serialsReceived.filter(
      (s) => !serialsShipped.includes(s)
    );

    const orderedVsShipped = item.quantityOrdered - totalShipped;
    const shippedVsReceived = totalShipped - totalReceived;

    let status = 'pending';
    if (totalReceived === 0 && totalShipped === 0) status = 'pending';
    else if (totalReceived === item.quantityOrdered && missingSerials.length === 0)
      status = 'complete';
    else if (totalReceived > 0) status = 'partial';
    else if (totalShipped > 0) status = 'shipped';

    return {
      itemId: item.id,
      description: item.description,
      partNumber: item.partNumber,
      quantityOrdered: item.quantityOrdered,
      totalShipped,
      totalReceived,
      orderedVsShippedDelta: orderedVsShipped,
      shippedVsReceivedDelta: shippedVsReceived,
      serialsOrdered: item.serials,
      serialsShipped,
      serialsReceived,
      missingSerials,
      extraSerials,
      status,
    };
  });
}

export function getOverallPOStatus(reconciliation) {
  if (reconciliation.every((r) => r.status === 'complete')) return 'complete';
  if (reconciliation.some((r) => r.status === 'partial' || r.status === 'shipped'))
    return 'in_progress';
  return 'pending';
}
