import json

from abslib.kp import KnowledgePatternManager, ConjunctKnowledgePatternItem, DisjunctKnowledgePatternItem, \
    QuantKnowledgePatternItem
import cups
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def consistency(request):
    try:
        if request.method == 'POST':
            json_data = json.loads(request.body)
            try:
                dict_data = json_data['data']
                str_type = json_data['type']
            except KeyError:
                return HttpResponse("Unable to parse data.", status=cups.HTTP_STATUS_BAD_REQUEST)

            key = 1
            while 2 ** key < len(dict_data):
                key += 1
            if len(dict_data) != 2 ** key:
                return HttpResponse(
                    "Wrong type of data. The correct one is a stack with length 2^k for some natural k.",
                    status=cups.HTTP_STATUS_BAD_REQUEST)

            arr_data = []
            key = 0
            while str(key) in dict_data:
                if (float(dict_data[str(key)]['0']) <= 1) and (float(dict_data[str(key)]['1']) >= 0) and \
                        (float(dict_data[str(key)]['0']) <= float(dict_data[str(key)]['1'])):
                    arr_data.append(
                        [max(float(dict_data[str(key)]['0']), 0.0), min(1.0, float(dict_data[str(key)]['1']))])
                    key += 1
                else:
                    return HttpResponse("Wrong type of data.", status=cups.HTTP_STATUS_BAD_REQUEST)

            if str_type == 'conjuncts':
                pattern = ConjunctKnowledgePatternItem(arr_data)
            elif str_type == 'disjuncts':
                pattern = DisjunctKnowledgePatternItem(arr_data)
            elif str_type == 'quants':
                pattern = QuantKnowledgePatternItem(arr_data)
            else:
                return HttpResponse("Wrong type of data. The correct ones are conjuncts, disjuncts, and quants.",
                                    status=cups.HTTP_STATUS_BAD_REQUEST)

            result = KnowledgePatternManager.checkConsistency(pattern)
            if result.consistent:
                return JsonResponse({'consistent': result.consistent,
                                     'data': result.array})
            else:
                return JsonResponse({'consistent': result.consistent})

        else:
            return HttpResponse("Wrong request method: POST required.", status=cups.HTTP_STATUS_BAD_REQUEST)
    except Exception:
        return HttpResponse("Server error", status=cups.HTTP_STATUS_SERVER_ERROR)


def index(request):
    return render(request, 'index.html')
