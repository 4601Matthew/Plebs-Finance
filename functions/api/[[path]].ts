export async function onRequest(context: any) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/', '');
  const method = request.method;

  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  const kv = env.FINANCE_KV;
  if (!kv) {
    return new Response(JSON.stringify({ error: 'KV not configured' }), {
      status: 500,
      headers,
    });
  }

  try {
    // Auth endpoints
    if (path === 'auth/verify' && method === 'POST') {
      const { pin } = await request.json();
      const storedPin = await kv.get('user:pin');
      
      if (!storedPin) {
        // First time setup - create PIN
        await kv.put('user:pin', pin);
        return new Response(JSON.stringify({ success: true, firstTime: true }), { headers });
      }
      
      if (storedPin === pin) {
        return new Response(JSON.stringify({ success: true }), { headers });
      }
      
      return new Response(JSON.stringify({ success: false, error: 'Invalid PIN' }), {
        status: 401,
        headers,
      });
    }

    if (path === 'auth/change-pin' && method === 'POST') {
      const { oldPin, newPin } = await request.json();
      const storedPin = await kv.get('user:pin');
      
      if (storedPin !== oldPin) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid current PIN' }), {
          status: 401,
          headers,
        });
      }
      
      await kv.put('user:pin', newPin);
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // User profile endpoints
    if (path === 'user/profile' && method === 'GET') {
      const profile = await kv.get('user:profile', 'json') || {
        name: '',
        picture: '',
        currency: 'NZD',
        timezone: 'Pacific/Auckland',
      };
      return new Response(JSON.stringify(profile), { headers });
    }

    if (path === 'user/profile' && method === 'POST') {
      const profile = await request.json();
      await kv.put('user:profile', JSON.stringify(profile));
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // Cashflow endpoints
    if (path === 'cashflow' && method === 'GET') {
      const cashflow = await kv.get('cashflow', 'json') || [];
      return new Response(JSON.stringify(cashflow), { headers });
    }

    if (path === 'cashflow' && method === 'POST') {
      const entry = await request.json();
      const cashflow = (await kv.get('cashflow', 'json')) || [];
      entry.id = Date.now().toString();
      entry.createdAt = new Date().toISOString();
      cashflow.push(entry);
      await kv.put('cashflow', JSON.stringify(cashflow));
      return new Response(JSON.stringify(entry), { headers });
    }

    if (path.startsWith('cashflow/') && method === 'DELETE') {
      const id = path.split('/')[1];
      const cashflow = (await kv.get('cashflow', 'json')) || [];
      const filtered = cashflow.filter((e: any) => e.id !== id);
      await kv.put('cashflow', JSON.stringify(filtered));
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // Credit card plans endpoints
    if (path === 'credit-cards' && method === 'GET') {
      const cards = await kv.get('credit-cards', 'json') || [];
      return new Response(JSON.stringify(cards), { headers });
    }

    if (path === 'credit-cards' && method === 'POST') {
      const card = await request.json();
      const cards = (await kv.get('credit-cards', 'json')) || [];
      card.id = Date.now().toString();
      cards.push(card);
      await kv.put('credit-cards', JSON.stringify(cards));
      return new Response(JSON.stringify(card), { headers });
    }

    if (path.startsWith('credit-cards/') && method === 'PUT') {
      const id = path.split('/')[1];
      const updatedCard = await request.json();
      const cards = (await kv.get('credit-cards', 'json')) || [];
      const index = cards.findIndex((c: any) => c.id === id);
      if (index !== -1) {
        cards[index] = { ...cards[index], ...updatedCard };
        await kv.put('credit-cards', JSON.stringify(cards));
        return new Response(JSON.stringify(cards[index]), { headers });
      }
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
    }

    if (path.startsWith('credit-cards/') && method === 'DELETE') {
      const id = path.split('/')[1];
      const cards = (await kv.get('credit-cards', 'json')) || [];
      const filtered = cards.filter((c: any) => c.id !== id);
      await kv.put('credit-cards', JSON.stringify(filtered));
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // Expenses endpoints
    if (path === 'expenses' && method === 'GET') {
      const expenses = await kv.get('expenses', 'json') || [];
      return new Response(JSON.stringify(expenses), { headers });
    }

    if (path === 'expenses' && method === 'POST') {
      const expense = await request.json();
      const expenses = (await kv.get('expenses', 'json')) || [];
      expense.id = Date.now().toString();
      expense.createdAt = new Date().toISOString();
      expenses.push(expense);
      await kv.put('expenses', JSON.stringify(expenses));
      return new Response(JSON.stringify(expense), { headers });
    }

    if (path.startsWith('expenses/') && method === 'DELETE') {
      const id = path.split('/')[1];
      const expenses = (await kv.get('expenses', 'json')) || [];
      const filtered = expenses.filter((e: any) => e.id !== id);
      await kv.put('expenses', JSON.stringify(filtered));
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // Bills endpoints
    if (path === 'bills' && method === 'GET') {
      const bills = await kv.get('bills', 'json') || [];
      return new Response(JSON.stringify(bills), { headers });
    }

    if (path === 'bills' && method === 'POST') {
      const bill = await request.json();
      const bills = (await kv.get('bills', 'json')) || [];
      bill.id = Date.now().toString();
      bill.createdAt = new Date().toISOString();
      bills.push(bill);
      await kv.put('bills', JSON.stringify(bills));
      return new Response(JSON.stringify(bill), { headers });
    }

    if (path.startsWith('bills/') && method === 'DELETE') {
      const id = path.split('/')[1];
      const bills = (await kv.get('bills', 'json')) || [];
      const filtered = bills.filter((b: any) => b.id !== id);
      await kv.put('bills', JSON.stringify(filtered));
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // Goals endpoints
    if (path === 'goals' && method === 'GET') {
      const goals = await kv.get('goals', 'json') || [];
      return new Response(JSON.stringify(goals), { headers });
    }

    if (path === 'goals' && method === 'POST') {
      const goal = await request.json();
      const goals = (await kv.get('goals', 'json')) || [];
      goal.id = Date.now().toString();
      goal.createdAt = new Date().toISOString();
      goals.push(goal);
      await kv.put('goals', JSON.stringify(goals));
      return new Response(JSON.stringify(goal), { headers });
    }

    if (path.startsWith('goals/') && method === 'PUT') {
      const id = path.split('/')[1];
      const updatedGoal = await request.json();
      const goals = (await kv.get('goals', 'json')) || [];
      const index = goals.findIndex((g: any) => g.id === id);
      if (index !== -1) {
        goals[index] = { ...goals[index], ...updatedGoal };
        await kv.put('goals', JSON.stringify(goals));
        return new Response(JSON.stringify(goals[index]), { headers });
      }
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
    }

    if (path.startsWith('goals/') && method === 'DELETE') {
      const id = path.split('/')[1];
      const goals = (await kv.get('goals', 'json')) || [];
      const filtered = goals.filter((g: any) => g.id !== id);
      await kv.put('goals', JSON.stringify(filtered));
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // Bank statement parsing endpoint
    if (path === 'bank-statement/parse' && method === 'POST') {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return new Response(JSON.stringify({ error: 'No file provided' }), {
          status: 400,
          headers,
        });
      }

      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      // Simple CSV/TSV parser - looks for date, description, amount patterns
      const transactions: any[] = [];
      const datePattern = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/;
      const amountPattern = /[\$]?([\d,]+\.?\d*)/;
      
      for (const line of lines) {
        if (datePattern.test(line)) {
          const dateMatch = line.match(datePattern);
          const amountMatch = line.match(amountPattern);
          
          if (dateMatch && amountMatch) {
            const dateStr = dateMatch[0];
            const amountStr = amountMatch[1].replace(/,/g, '');
            const amount = parseFloat(amountStr);
            
            if (!isNaN(amount)) {
              transactions.push({
                date: dateStr,
                description: line.replace(datePattern, '').replace(amountPattern, '').trim(),
                amount: amount,
              });
            }
          }
        }
      }
      
      return new Response(JSON.stringify({ transactions }), { headers });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers,
    });
  }
}

