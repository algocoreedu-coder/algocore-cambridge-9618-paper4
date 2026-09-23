"""Reference answers for Unit 13 labs. Python 3; standard library only."""
from fractions import Fraction
from decimal import Decimal
import json

def signed(bits):
    return int(bits, 2) - (2 ** len(bits) if bits[0] == '1' else 0)

def decode(mantissa, exponent):
    return Fraction(signed(mantissa), 2 ** (len(mantissa)-1)) * Fraction(2) ** signed(exponent)

def representations(m=8, e=4):
    result = [(Fraction(0), '0'*m, '0'*e)]
    for integer in range(2**m):
        mb = f'{integer:0{m}b}'
        if mb[:2] not in ('01', '10'):
            continue
        for exponent in range(2**e):
            eb = f'{exponent:0{e}b}'
            result.append((decode(mb, eb), mb, eb))
    return result

def nearest(value, candidates):
    # Ties go to an even signed mantissa integer. This lab stays in range.
    return min(candidates, key=lambda row: (abs(row[0]-value), signed(row[1]) % 2))

def hash_name(name):
    if not 1 <= len(name) <= 10 or not name.isascii():
        raise ValueError('Use 1 to 10 ASCII characters')
    total = sum(ord(ch) for ch in name)
    slot = total % 1000
    return {'name':name, 'total':total, 'slot':slot, 'address':2000+20*slot}

def lab1():
    a,b={1,3,5},{3,4,5}
    result={'union':sorted(a|b),'intersection':sorted(a&b),'difference':sorted(a-b)}
    a.add(3)
    result.update(after_duplicate=sorted(a),member=3 in a,subset={1,3} <= a)
    return result

def lab2():
    slots=[None]*10
    for name in ['AC','CA']:
        address=sum(map(ord,name))%10
        for _ in range(10):
            if slots[address] is None:
                slots[address]=name
                break
            address=(address+1)%10
        else:
            raise ValueError('Table full')
    trace=[]
    for offset in range(10):
        address=(sum(map(ord,'CA'))%10+offset)%10
        trace.append(address)
        if slots[address] in (None,'CA'):
            break
    return {'hashes':[hash_name(s) for s in ['AC','CA']], 'slots':slots, 'find_CA':trace}

def lab3():
    candidates=representations()
    increment=nearest(Fraction(1,10),candidates)
    total=Fraction(0)
    rows=[]
    for n in range(1,4):
        exact_sum=n*increment[0]
        total=nearest(total+increment[0],candidates)[0]
        rows.append({'n':n,'ideal':str(Fraction(n,10)),
                     'input_only_sum':str(exact_sum),'input_only_decimal':str(float(exact_sum)),
                     'signed_error':str(exact_sum-Fraction(n,10)),
                     'round_each_sum':str(total),'round_each_decimal':str(float(total))})
    binary_total=0.0
    decimal_total=Decimal('0')
    runtime=[]
    for n in range(1,11):
        binary_total+=0.1
        decimal_total+=Decimal('0.1')
        runtime.append({'n':n,'float_repr':repr(binary_total),'float_17g':format(binary_total,'.17g'),
                        'decimal_from_string':str(decimal_total),'integer_cents':10*n})
    return {'nearest_input':{'fraction':str(increment[0]),'M':increment[1],'E':increment[2]},
            'exact_models':rows,'runtime_observation':runtime}

if __name__=='__main__':
    print(json.dumps({'lab1':lab1(),'lab2':lab2(),'lab3':lab3()},indent=2))
